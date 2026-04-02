<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;

class CartController extends Controller
{
    // Add an item to the cart
    public function addToCart(Request $request)
    {
        $user_id     = auth()->id();
        $medicine_id = $request->medicine_id;
        $quantity    = $request->quantity;

        // Check if this medicine is already in the user's cart
        $existing = Cart::where('user_id', $user_id)
                        ->where('medicine_id', $medicine_id)
                        ->first();

        if ($existing) {
            // If it exists, increase the quantity
            $existing->increment('quantity', $quantity);
        } else {
            // Otherwise, insert a new row
            Cart::create([
                'user_id'     => $user_id,
                'medicine_id' => $medicine_id,
                'quantity'    => $quantity
            ]);
        }

        return response()->json(['message' => 'Item added to cart successfully']);
    }

    // Update the quantity of a cart item
    public function updateCart(Request $request)
    {
        $user_id  = auth()->id();
        $cart_id  = $request->cart_id;
        $quantity = $request->quantity;

        // Find the cart item — make sure it belongs to the logged-in user
        $cartItem = Cart::where('id', $cart_id)
                        ->where('user_id', $user_id)
                        ->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        $cartItem->update(['quantity' => $quantity]);

        return response()->json(['message' => 'Cart quantity updated']);
    }

    // Remove an item from the cart
    public function removeFromCart($id)
    {
        $user_id = auth()->id();

        // Find the cart item — make sure it belongs to the logged-in user
        $cartItem = Cart::where('id', $id)
                        ->where('user_id', $user_id)
                        ->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        $cartItem->delete();

        return response()->json(['message' => 'Item removed from cart']);
    }

    // Clear entire cart for logged-in user
    public function clearCart()
    {
        $user_id = auth()->id();

        Cart::where('user_id', $user_id)->delete();

        return response()->json(['message' => 'Cart cleared successfully']);
    }

    // Get all items in the logged-in user's cart
    public function getMyCart()
    {
        $user_id = auth()->id();

        // Use Eloquent relationship to get cart items with medicine details
        $cartItems = Cart::where('user_id', $user_id)
                        ->with('medicine')
                        ->get()
                        ->map(function ($item) {
                            return [
                                'cart_id'     => $item->id,
                                'quantity'    => $item->quantity,
                                'medicine_id' => $item->medicine->id,
                                'name'        => $item->medicine->name,
                                'price'       => $item->medicine->price,
                                'company'     => $item->medicine->company,
                            ];
                        });

        return response()->json($cartItems);
    }
}