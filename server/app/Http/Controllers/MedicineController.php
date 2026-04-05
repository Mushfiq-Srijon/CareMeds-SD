<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MedicineController extends Controller
{
    // GET /api/medicines
    public function index()
    {
        $medicines = DB::select(
            'SELECT * FROM medicines 
             ORDER BY 
                CASE WHEN pharmacy_id IS NOT NULL THEN 0 ELSE 1 END,
                id ASC'
        );
        return response()->json($medicines);
    }

    //  5: GET /api/medicines/{id}
    public function show($id)
    {
        $medicine = DB::selectOne(
            'SELECT m.*, p.pharmacy_name, p.location, p.phone
             FROM medicines m
             JOIN pharmacies p ON m.pharmacy_id = p.id
             WHERE m.id = ?',
            [$id]
        );

        if (!$medicine) {
            return response()->json([
                'success' => false,
                'message' => 'Medicine not found'
            ], 404);
        }

        return response()->json($medicine);
    }

    // POST /api/medicines
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'         => 'required|string|max:255',
            'generic_name' => 'required|string|max:255',
            'company'      => 'required|string|max:255',
            'category'     => 'required|string|max:255',
            'stock'        => 'required|integer|min:0',
            'price'        => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        $pharmacy = DB::selectOne(
            'SELECT id FROM pharmacies WHERE user_id = ?',
            [$user->id]
        );

        if (!$pharmacy) {
            return response()->json([
                'success' => false,
                'message' => 'Please set up your pharmacy profile first.'
            ], 403);
        }

        DB::insert(
            'INSERT INTO medicines
                (pharmacy_id, name, generic_name, company, category, stock, price, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [
                $pharmacy->id,
                $request->name,
                $request->generic_name,
                $request->company,
                $request->category,
                $request->stock,
                $request->price
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Medicine added successfully!'
        ], 201);
    }

    // PUT /api/medicines/{id}
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'stock' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        $pharmacy = DB::selectOne(
            'SELECT id FROM pharmacies WHERE user_id = ?',
            [$user->id]
        );

        if (!$pharmacy) {
            return response()->json([
                'success' => false,
                'message' => 'Pharmacy profile not found.'
            ], 403);
        }

        $medicine = DB::selectOne(
            'SELECT id FROM medicines WHERE id = ? AND pharmacy_id = ?',
            [$id, $pharmacy->id]
        );

        if (!$medicine) {
            return response()->json([
                'success' => false,
                'message' => 'Medicine not found or does not belong to your pharmacy.'
            ], 404);
        }

        DB::update(
            'UPDATE medicines SET stock = ?, price = ?, updated_at = NOW() WHERE id = ?',
            [$request->stock, $request->price, $id]
        );

        return response()->json([
            'success' => true,
            'message' => 'Medicine updated successfully!'
        ]);
    }

    // DELETE /api/medicines/{id}
    public function destroy(Request $request, $id)
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
            ], 403);
        }

        $medicine = DB::selectOne(
            'SELECT id FROM medicines WHERE id = ? AND pharmacy_id = ?',
            [$id, $pharmacy->id]
        );

        if (!$medicine) {
            return response()->json([
                'success' => false,
                'message' => 'Medicine not found or does not belong to your pharmacy.'
            ], 404);
        }

        DB::delete('DELETE FROM medicines WHERE id = ?', [$id]);

        return response()->json([
            'success' => true,
            'message' => 'Medicine deleted successfully!'
        ]);
    }
}
