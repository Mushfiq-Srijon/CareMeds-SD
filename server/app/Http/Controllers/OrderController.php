<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Medicine;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Rider;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'pharmacy_id'   => 'required',
            'delivery_type' => 'required|in:home_delivery,pickup',
            'items'         => 'required|array'
        ]);

        return DB::transaction(function () use ($request) {

            $deliveryCharge = $request->delivery_type == 'home_delivery' ? 50 : 0;

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
                'user_id'         => Auth::id(),
                'pharmacy_id'     => $request->pharmacy_id,
                'delivery_type'   => $request->delivery_type,
                'delivery_charge' => $deliveryCharge,
                'total_price'     => $totalPrice,
                'rider_id'        => $riderId,
                'phone'           => $request->phone,
                'address'         => $request->address,
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

            return response()->json([
                'message'        => 'Order placed successfully',
                'order_id'       => $order->id,
                'rider_assigned' => $riderId
            ]);
        });
    }

    // Task 3: Customer's own orders — NO CHANGE
    public function myOrders(Request $request)
    {
        $user = $request->user();

        $orders = DB::select("
            SELECT o.*,
                   GROUP_CONCAT(m.name SEPARATOR ', ') as medicine_names
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN medicines m ON oi.medicine_id = m.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        ", [$user->id]);

        return response()->json($orders);
    }

    // ── Task 4 — Pharmacy incoming orders ──
    // GET /api/pharmacy/orders
    public function pharmacyOrders(Request $request)
    {
        $user = $request->user();

        $pharmacy = DB::selectOne(
            'SELECT id FROM pharmacies WHERE user_id = ?',
            [$user->id]
        );

        if (!$pharmacy) {
            return response()->json([
                'success' => false,
                'message' => 'Pharmacy profile not found.'
            ], 404);
        }

        $orders = DB::select("
            SELECT
                o.id,
                o.status,
                o.delivery_type,
                o.total_price,
                o.delivery_charge,
                o.address,
                o.phone,
                o.created_at,
                u.name  as customer_name,
                u.email as customer_email,
                GROUP_CONCAT(
                    CONCAT(m.name, ' x', oi.quantity)
                    ORDER BY m.name
                    SEPARATOR ', '
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

        return response()->json([
            'success' => true,
            'orders'  => $orders,
        ]);
    }

    // ── GET order items (medicines + quantity) for a specific order ──
    // GET /api/pharmacy/orders/{id}/items
    public function orderItems(Request $request, $id)
    {
        $user = $request->user();

        $pharmacy = DB::selectOne(
            'SELECT id FROM pharmacies WHERE user_id = ?',
            [$user->id]
        );

        if (!$pharmacy) {
            return response()->json([
                'success' => false,
                'message' => 'Pharmacy not found.'
            ], 404);
        }

        // make sure this order belongs to this pharmacy
        $order = DB::selectOne(
            'SELECT id FROM orders WHERE id = ? AND pharmacy_id = ?',
            [$id, $pharmacy->id]
        );

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.'
            ], 404);
        }

        $items = DB::select("
            SELECT
                m.name,
                m.generic_name,
                oi.quantity,
                oi.price
            FROM order_items oi
            JOIN medicines m ON oi.medicine_id = m.id
            WHERE oi.order_id = ?
        ", [$id]);

        return response()->json([
            'success' => true,
            'items'   => $items,
        ]);
    }

    // ── Update order status ──
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
            return response()->json([
                'success' => false,
                'message' => 'Pharmacy not found.'
            ], 404);
        }

        $order = DB::selectOne(
            'SELECT id FROM orders WHERE id = ? AND pharmacy_id = ?',
            [$id, $pharmacy->id]
        );

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.'
            ], 404);
        }

        DB::update(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            [$request->status, $id]
        );

        return response()->json([
            'success' => true,
            'message' => 'Order status updated to ' . $request->status,
        ]);
    }
}