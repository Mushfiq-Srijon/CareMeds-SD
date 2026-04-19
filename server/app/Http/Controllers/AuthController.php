<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

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

        // Generate verification URL
        $id = $user->getKey();
        $hash = sha1($user->getEmailForVerification());
        $verifyUrl = config('app.url') . "/api/email/verify/{$id}/{$hash}";

        // Send via Resend HTTP API
        $resendKey = config('services.resend.api_key');

        if ($resendKey) {
            $client = \Resend::client($resendKey);
            $client->emails->send([
                'from' => 'CareMeds <onboarding@resend.dev>',
                'to' => [$user->email],
                'subject' => 'Verify your CareMeds account',
                'html' => '
                <h2>Welcome to CareMeds!</h2>
                <p>Hi ' . $user->name . ', please verify your email by clicking the button below:</p>
                <a href="' . $verifyUrl . '" style="background:#0d3b6e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0;">
                    Verify Email
                </a>
                <p>If the button does not work, copy this link: ' . $verifyUrl . '</p>
            ',
            ]);
        }

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
            'new_password' => 'required|string|min:6',
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
