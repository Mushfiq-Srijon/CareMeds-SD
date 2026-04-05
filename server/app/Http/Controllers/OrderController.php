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

            // Delivery charge
            $deliveryCharge = $request->delivery_type == 'home_delivery' ? 50 : 0;

            // Validate stock AND calculate total BEFORE inserting anything
            $totalPrice = 0;
            foreach ($request->items as $item) {

                // Find medicine using Eloquent
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

            // Assign random rider using Eloquent
            $rider   = Rider::inRandomOrder()->first();
            $riderId = $rider ? $rider->id : null;

            // Create the order using Eloquent
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

            // Insert order items and deduct stock
            foreach ($request->items as $item) {
                $medicine = Medicine::find($item['medicine_id']);

                // Create order item using Eloquent
                OrderItem::create([
                    'order_id'    => $order->id,
                    'medicine_id' => $item['medicine_id'],
                    'quantity'    => $item['quantity'],
                    'price'       => $medicine->price,
                ]);

                // Deduct stock using Eloquent
                $medicine->decrement('stock', $item['quantity']);
            }

            return response()->json([
                'message'        => 'Order placed successfully',
                'order_id'       => $order->id,
                'rider_assigned' => $riderId
            ]);
        });
    }

   
    public function myOrders(Request $request)
    {
        $user = $request->user();

        $sql = "
            SELECT o.*,
                   GROUP_CONCAT(m.name SEPARATOR ', ') as medicine_names
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN medicines m ON oi.medicine_id = m.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        ";

        $orders = DB::select($sql, [$user->id]);

        return response()->json($orders);
    }
}
