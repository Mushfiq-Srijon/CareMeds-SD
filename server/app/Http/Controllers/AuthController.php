<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;

class AuthController extends Controller
{
    // Register method
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:customer,pharmacy,admin'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
    'name' => $request->name,
    'email' => $request->email,
    'password' => Hash::make($request->password),
    'role' => $request->role,
]);

// Send verification email automatically after registration
event(new Registered($user));

return response()->json([
    'message' => 'Registration successful. Please check your email to verify your account.',
    'user' => $user
], 201);
    }

    // Login method
    public function login(Request $request)
{
    $credentials = $request->only('email', 'password');

    if (!Auth::attempt($credentials)) {
    return response()->json([
        'message' => 'Invalid credentials'
    ], 401);
}

$user = Auth::user();

// Block login if email is not verified
if (!$user->hasVerifiedEmail()) {
    return response()->json([
        'message' => 'Please verify your email before logging in. Check your inbox.'
    ], 403);
}

$token = $user->createToken('api-token')->plainTextToken;

return response()->json([
    'message' => 'Login successful',
    'token' => $token,
    'user' => $user
]);
}
// Change password method
public function changePassword(Request $request)
{
    $request->validate([
        'current_password' => 'required|string',
        'new_password'     => 'required|string|min:6',
    ]);

    $user = Auth::user();

    // Check if current password is correct
    if (!Hash::check($request->current_password, $user->password)) {
        return response()->json([
            'message' => 'Current password is incorrect.'
        ], 422);
    }

    // Update password
    $user->update([
        'password' => Hash::make($request->new_password)
    ]);

    return response()->json([
        'message' => 'Password changed successfully.'
    ], 200);
}
}
