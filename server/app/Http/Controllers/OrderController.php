<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Medicine;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Rider;
use Illuminate\Support\Facades\Mail;
use App\Mail\InvoiceMail;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'pharmacy_id'              => 'required',
            'delivery_type'            => 'required|in:home_delivery,pickup',
            'items'                    => 'required|array',
            'payment_type'             => 'required|in:stripe,cod',
            'stripe_payment_intent_id' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request) {

            $deliveryCharge = $request->delivery_type === 'home_delivery' ? 50 : 0;

            $totalPrice = 0;
            foreach ($request->items as $item) {
                $medicine = Medicine::find($item['medicine_id']);
                if (!$medicine) {
                    throw new \Exception("Medicine not found: " . $item['medicine_id']);
                }
                if ($item['quantity'] > $medicine->stock) {
                    throw new \Exception("Not enough stock for medicine id " . $item['medicine_id']);
                }
                $totalPrice += $medicine->price * $item['quantity'];
            }

            $totalPrice += $deliveryCharge;

            $rider   = Rider::inRandomOrder()->first();
            $riderId = $rider ? $rider->id : null;

            $order = Order::create([
                'user_id'                  => Auth::id(),
                'pharmacy_id'              => $request->pharmacy_id,
                'delivery_type'            => $request->delivery_type,
                'delivery_charge'          => $deliveryCharge,
                'total_price'              => $totalPrice,
                'rider_id'                 => $riderId,
                'recipient_name'           => $request->recipient_name,
                'phone'                    => $request->phone,
                'address'                  => $request->address,
                'payment_type'             => $request->payment_type,
                'payment_status'           => $request->payment_type === 'stripe' ? 'paid' : 'pending',
                'stripe_payment_intent_id' => $request->stripe_payment_intent_id,
            ]);

            foreach ($request->items as $item) {
                $medicine = Medicine::find($item['medicine_id']);
                OrderItem::create([
                    'order_id'    => $order->id,
                    'medicine_id' => $item['medicine_id'],
                    'quantity'    => $item['quantity'],
                    'price'       => $medicine->price,
                ]);
                $medicine->decrement('stock', $item['quantity']);
            }

            // Fetch order items for invoice
            $invoiceItems = DB::select("
                SELECT m.name, oi.quantity, oi.price
                FROM order_items oi
                JOIN medicines m ON oi.medicine_id = m.id
                WHERE oi.order_id = ?
            ", [$order->id]);

            // Fetch customer info
            $customer = DB::selectOne(
                "SELECT name, email FROM users WHERE id = ?",
                [Auth::id()]
            );

            // Build order object for invoice
            $orderForInvoice = (object) [
                'id'            => $order->id,
                'customer_name' => $request->recipient_name ?? $customer->name,
                'phone'         => $order->phone,
                'address'       => $order->address,
                'delivery_type' => $order->delivery_type,
                'delivery_charge' => $order->delivery_charge,
                'total_price'   => $order->total_price,
                'payment_type'  => $order->payment_type,
                'created_at'    => $order->created_at,
            ];

            // Send invoice email
            try {
                Mail::to($customer->email)->send(new InvoiceMail($orderForInvoice, $invoiceItems));
            } catch (\Exception $e) {
                \Log::error('Invoice mail failed: ' . $e->getMessage());
            }

            return response()->json([
                'message'        => 'Order placed successfully',
                'order_id'       => $order->id,
                'rider_assigned' => $riderId,
            ]);
        });
    }

    // Task 3: Customer's own orders
    public function myOrders(Request $request)
    {
        $user = $request->user();

        $orders = DB::select("
            SELECT
                o.id,
                o.user_id,
                o.pharmacy_id,
                o.rider_id,
                o.delivery_type,
                o.status,
                o.consignment_id,
                o.total_price,
                o.delivery_charge,
                o.phone,
                o.address,
                o.created_at,
                o.updated_at,
                GROUP_CONCAT(m.name SEPARATOR ', ') as medicine_names
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN medicines m ON oi.medicine_id = m.id
            WHERE o.user_id = ?
            GROUP BY
                o.id, o.user_id, o.pharmacy_id, o.rider_id,
                o.delivery_type, o.status, o.consignment_id,
                o.total_price, o.delivery_charge, o.phone,
                o.address, o.created_at, o.updated_at
            ORDER BY o.created_at DESC
        ", [$user->id]);

        return response()->json($orders);
    }

    // GET /api/pharmacy/orders
    public function pharmacyOrders(Request $request)
    {
        $user = $request->user();

        $pharmacy = DB::selectOne(
            'SELECT id FROM pharmacies WHERE user_id = ?',
            [$user->id]
        );

        if (!$pharmacy) {
            return response()->json(['success' => false, 'message' => 'Pharmacy profile not found.'], 404);
        }

        $orders = DB::select("
            SELECT
                o.id, o.status, o.delivery_type, o.total_price,
                o.delivery_charge, o.address, o.phone, o.created_at,
                u.name  as customer_name,
                u.email as customer_email,
                GROUP_CONCAT(
                    CONCAT(m.name, ' x', oi.quantity)
                    ORDER BY m.name SEPARATOR ', '
                ) as medicine_names
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN medicines m ON oi.medicine_id = m.id
            WHERE o.pharmacy_id = ?
            GROUP BY
                o.id, o.status, o.delivery_type, o.total_price,
                o.delivery_charge, o.address, o.phone, o.created_at,
                u.name, u.email
            ORDER BY o.created_at DESC
        ", [$pharmacy->id]);

        return response()->json(['success' => true, 'orders' => $orders]);
    }

    // GET /api/pharmacy/orders/{id}/items
    public function orderItems(Request $request, $id)
    {
        $user = $request->user();

        $pharmacy = DB::selectOne(
            'SELECT id FROM pharmacies WHERE user_id = ?',
            [$user->id]
        );

        if (!$pharmacy) {
            return response()->json(['success' => false, 'message' => 'Pharmacy not found.'], 404);
        }

        $order = DB::selectOne(
            'SELECT id FROM orders WHERE id = ? AND pharmacy_id = ?',
            [$id, $pharmacy->id]
        );

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        }

        $items = DB::select("
            SELECT m.name, m.generic_name, oi.quantity, oi.price
            FROM order_items oi
            JOIN medicines m ON oi.medicine_id = m.id
            WHERE oi.order_id = ?
        ", [$id]);

        return response()->json(['success' => true, 'items' => $items]);
    }

    // PUT /api/pharmacy/orders/{id}/status
    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,assigned,delivered,completed'
        ]);

        $user = $request->user();

        $pharmacy = DB::selectOne(
            'SELECT id FROM pharmacies WHERE user_id = ?',
            [$user->id]
        );

        if (!$pharmacy) {
            return response()->json(['success' => false, 'message' => 'Pharmacy not found.'], 404);
        }

        $order = DB::selectOne(
            'SELECT id FROM orders WHERE id = ? AND pharmacy_id = ?',
            [$id, $pharmacy->id]
        );

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        }

        DB::update(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            [$request->status, $id]
        );

        return response()->json(['success' => true, 'message' => 'Order status updated to ' . $request->status]);
    }

    // GET /api/invoice/{id}
    public function invoiceData($id)
    {
        $user = Auth::user();

        $order = DB::selectOne("
            SELECT o.*,
                   COALESCE(o.recipient_name, u.name) as customer_name,
                   u.email as customer_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ? AND o.user_id = ?
        ", [$id, $user->id]);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $items = DB::select("
            SELECT m.name, m.generic_name, oi.quantity, oi.price
            FROM order_items oi
            JOIN medicines m ON oi.medicine_id = m.id
            WHERE oi.order_id = ?
        ", [$id]);

        return response()->json(['order' => $order, 'items' => $items]);
    }
}