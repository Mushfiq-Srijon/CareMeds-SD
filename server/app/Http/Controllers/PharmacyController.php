<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PharmacyController extends Controller
{
    // GET /api/pharmacy/profile
    public function profile(Request $request)
    {
        $user = $request->user();

        $pharmacy = DB::selectOne(
            'SELECT * FROM pharmacies WHERE user_id = ?',
            [$user->id]
        );

        if (!$pharmacy) {
            return response()->json([
                'success' => false,
                'message' => 'No profile found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'pharmacy' => $pharmacy
        ]);
    }

    // POST /api/pharmacy/setup
    public function setup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pharmacy_name' => 'required|string|max:255',
            'location'      => 'required|string|max:255',
            'phone'         => ['required', 'regex:/^01[0-9]{9}$/'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        $existing = DB::selectOne(
            'SELECT id FROM pharmacies WHERE user_id = ?',
            [$user->id]
        );

        if ($existing) {
            DB::update(
                'UPDATE pharmacies SET pharmacy_name = ?, location = ?, phone = ?, updated_at = NOW()
                 WHERE user_id = ?',
                [
                    $request->pharmacy_name,
                    $request->location,
                    $request->phone,
                    $user->id
                ]
            );
        } else {
            DB::insert(
                'INSERT INTO pharmacies (user_id, pharmacy_name, location, phone, created_at, updated_at)
                 VALUES (?, ?, ?, ?, NOW(), NOW())',
                [
                    $user->id,
                    $request->pharmacy_name,
                    $request->location,
                    $request->phone
                ]
            );
        }

        $pharmacy = DB::selectOne(
            'SELECT * FROM pharmacies WHERE user_id = ?',
            [$user->id]
        );

        return response()->json([
            'success'  => true,
            'message'  => 'Pharmacy profile saved!',
            'pharmacy' => $pharmacy
        ]);
    }

    // GET /api/pharmacy/medicines
    public function medicines(Request $request)
    {
        $user = $request->user();

        $pharmacy = DB::selectOne(
            'SELECT id FROM pharmacies WHERE user_id = ?',
            [$user->id]
        );

        if (!$pharmacy) {
            return response()->json([
                'success' => false,
                'message' => 'Please set up your pharmacy profile first.'
            ], 404);
        }

        $medicines = DB::select(
            'SELECT * FROM medicines WHERE pharmacy_id = ? ORDER BY created_at DESC',
            [$pharmacy->id]
        );

        return response()->json([
            'success'   => true,
            'medicines' => $medicines
        ]);
    }

    // GET /api/pharmacy/orders
    public function orders(Request $request)
    {
        $user = $request->user();

        $pharmacy = DB::selectOne(
            'SELECT id FROM pharmacies WHERE user_id = ?',
            [$user->id]
        );

        if (!$pharmacy) {
            return response()->json(['success' => false, 'message' => 'No pharmacy profile found.'], 404);
        }

        $orders = DB::select("
            SELECT
                o.id, o.status, o.delivery_type, o.total_price,
                o.delivery_charge, o.address, o.phone, o.created_at,
                o.consignment_id,
                o.payment_type,
                o.payment_status,
                u.name  as customer_name,
                u.email as customer_email,
                GROUP_CONCAT(
                    CONCAT(m.name, ' x', oi.quantity)
                    ORDER BY m.name
                    SEPARATOR ', '
                ) as medicine_names
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN medicines m ON oi.medicine_id = m.id
            WHERE o.pharmacy_id = ?
            GROUP BY
                o.id, o.status, o.delivery_type, o.total_price,
                o.delivery_charge, o.address, o.phone, o.created_at,
                o.consignment_id, o.payment_type, o.payment_status,
                u.name, u.email
            ORDER BY o.created_at DESC
        ", [$pharmacy->id]);

        return response()->json([
            'success' => true,
            'orders'  => $orders
        ]);
    }
}