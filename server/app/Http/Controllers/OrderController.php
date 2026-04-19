<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Medicine;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Mail;
use App\Mail\InvoiceMail;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'pharmacy_id' => 'required',
            'delivery_type' => 'required|in:home_delivery,pickup',
            'items' => 'required|array',
            'payment_type' => 'required|in:stripe,cod',
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

            $order = Order::create([
                'user_id' => Auth::id(),
                'pharmacy_id' => $request->pharmacy_id,
                'delivery_type' => $request->delivery_type,
                'delivery_charge' => $deliveryCharge,
                'total_price' => $totalPrice,
                'recipient_name' => $request->recipient_name,
                'phone' => $request->phone,
                'address' => $request->address,
                'payment_type' => $request->payment_type,
                'payment_status' => $request->payment_type === 'stripe' ? 'paid' : 'pending',
                'stripe_payment_intent_id' => $request->stripe_payment_intent_id,
            ]);

            foreach ($request->items as $item) {
                $medicine = Medicine::find($item['medicine_id']);
                OrderItem::create([
                    'order_id' => $order->id,
                    'medicine_id' => $item['medicine_id'],
                    'quantity' => $item['quantity'],
                    'price' => $medicine->price,
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
                'id' => $order->id,
                'customer_name' => $request->recipient_name ?? $customer->name,
                'phone' => $order->phone,
                'address' => $order->address,
                'delivery_type' => $order->delivery_type,
                'delivery_charge' => $order->delivery_charge,
                'total_price' => $order->total_price,
                'payment_type' => $order->payment_type,
                'created_at' => $order->created_at,
            ];

            // Build invoice HTML for email
            $itemRows = '';
            foreach ($invoiceItems as $item) {
                $itemRows .= '<tr>
                    <td style="padding:8px;border-bottom:1px solid #eee;">' . $item->name . '</td>
                    <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">' . $item->quantity . '</td>
                    <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">' . $item->price . ' BDT</td>
                    <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">' . ($item->price * $item->quantity) . ' BDT</td>
                </tr>';
            }

            $invoiceHtml = '
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #eee;border-radius:10px;">
                    <div style="background:#0a2342;padding:20px;border-radius:8px 8px 0 0;">
                        <h1 style="color:#fff;margin:0;font-size:24px;">CareMeds</h1>
                        <p style="color:#7ec8e3;margin:4px 0 0;">Medicine Delivery Platform</p>
                    </div>
                    <div style="padding:24px;">
                        <h2 style="color:#0a2342;">Invoice #' . $order->id . '</h2>
                        <p><strong>Name:</strong> ' . $orderForInvoice->customer_name . '</p>
                        <p><strong>Phone:</strong> ' . $order->phone . '</p>
                        <p><strong>Address:</strong> ' . $order->address . '</p>
                        <p><strong>Delivery:</strong> ' . ($order->delivery_type === 'home_delivery' ? 'Home Delivery' : 'Self Pickup') . '</p>
                        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                            <thead>
                                <tr style="background:#0a2342;color:#fff;">
                                    <th style="padding:10px;text-align:left;">Medicine</th>
                                    <th style="padding:10px;text-align:center;">Qty</th>
                                    <th style="padding:10px;text-align:right;">Price</th>
                                    <th style="padding:10px;text-align:right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>' . $itemRows . '</tbody>
                        </table>
                        <div style="text-align:right;margin-top:16px;">
                            <p>Delivery Charge: ' . $deliveryCharge . ' BDT</p>
                            <p style="font-size:18px;font-weight:bold;color:#0a2342;">Grand Total: ' . $totalPrice . ' BDT</p>
                        </div>
                        <p style="margin-top:24px;color:#888;font-size:13px;">Thank you for using CareMeds. Get well soon!</p>
                    </div>
                </div>
            ';

            // Send invoice email
            try {
                $resendKey = config('services.resend.api_key');

                if ($resendKey) {
                    // Production: use Resend HTTP API
                    $client = \Resend::client($resendKey);
                    $client->emails->send([
                        'from' => 'CareMeds <onboarding@resend.dev>',
                        'to' => [$customer->email],
                        'subject' => 'Your CareMeds Invoice #' . $order->id,
                        'html' => $invoiceHtml,
                    ]);
                } else {
                    // Local development: use Laravel Mail with SMTP
                    Mail::to($customer->email)->send(new InvoiceMail($orderForInvoice, $invoiceItems));
                }
            } catch (\Exception $e) {
                \Log::error('Invoice mail failed: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Order placed successfully',
                'order_id' => $order->id,
            ]);
        });
    }

    // Customer's own orders
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
                o.consignment_id,
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
                o.consignment_id, u.name, u.email
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