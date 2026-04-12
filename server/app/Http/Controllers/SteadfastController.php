<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class SteadfastController extends Controller
{
    public function sendToSteadfast(Request $request, $orderId)
    {
        $user = Auth::user();

        // Verify pharmacy owns this order
        $pharmacy = DB::selectOne(
            'SELECT * FROM pharmacies WHERE user_id = ?',
            [$user->id]
        );

        if (!$pharmacy) {
            return response()->json(['message' => 'Pharmacy not found'], 404);
        }

        $order = DB::selectOne(
            'SELECT o.*, u.name as customer_name, u.email as customer_email
             FROM orders o
             JOIN users u ON o.user_id = u.id
             WHERE o.id = ? AND o.pharmacy_id = ?',
            [$orderId, $pharmacy->id]
        );

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($order->consignment_id) {
            return response()->json(['message' => 'Already dispatched', 'consignment_id' => $order->consignment_id]);
        }

        // Sandbox mode — skip real API call
        if (config('services.steadfast.sandbox')) {
            $fakeConsignmentId = 'TEST-' . strtoupper(uniqid());

            DB::update(
                'UPDATE orders SET consignment_id = ?, status = ?, updated_at = NOW() WHERE id = ?',
                [$fakeConsignmentId, 'confirmed', $orderId]
            );

            return response()->json([
                'success' => true,
                'message' => 'Dispatched (sandbox mode)',
                'consignment_id' => $fakeConsignmentId,
            ]);
        }

        // Real Steadfast API call
        $response = Http::withHeaders([
            'Api-Key'    => config('services.steadfast.api_key'),
            'Secret-Key' => config('services.steadfast.secret_key'),
            'Content-Type' => 'application/json',
        ])->post('https://portal.steadfast.com.bd/api/v1/create_order', [
            'invoice'            => 'CM-' . $order->id,
            'recipient_name'     => $order->customer_name,
            'recipient_phone'    => $order->phone,
            'recipient_address'  => $order->address,
            'cod_amount'         => $order->total_price,
            'note'               => 'CareMeds Order #' . $order->id,
        ]);

        if (!$response->successful()) {
            return response()->json([
                'message' => 'Steadfast API error',
                'details' => $response->json(),
            ], 500);
        }

        $result = $response->json();
        $consignmentId = $result['consignment']['tracking_code'] ?? null;

        if (!$consignmentId) {
            return response()->json(['message' => 'No tracking code returned from Steadfast'], 500);
        }

        DB::update(
            'UPDATE orders SET consignment_id = ?, status = ?, updated_at = NOW() WHERE id = ?',
            [$consignmentId, 'confirmed', $orderId]
        );

        return response()->json([
            'success'        => true,
            'message'        => 'Dispatched successfully',
            'consignment_id' => $consignmentId,
        ]);
    }
}