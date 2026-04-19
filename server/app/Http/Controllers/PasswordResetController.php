<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\User;
use App\Models\PasswordResetToken;

class PasswordResetController extends Controller
{
    // Step 1: User submits their email
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        // Check if email exists using Eloquent
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'If this email exists, a reset link has been sent.'
            ], 200);
        }

        // Delete any existing token for this email using Eloquent
        PasswordResetToken::where('email', $request->email)->delete();

        // Generate a secure random token
        $token = Str::random(64);

        // Store token with 15 minute expiry using Eloquent
        PasswordResetToken::create([
            'email' => $request->email,
            'token' => $token,
            'expires_at' => Carbon::now()->addMinutes(15)
        ]);

        // Build the reset URL
        $resetUrl = env('FRONTEND_URL') . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);

        // Send the email
        // Send the email
        $resendKey = config('services.resend.api_key');

        if ($resendKey) {
            $client = \Resend::client($resendKey);
            $client->emails->send([
                'from' => 'CareMeds <onboarding@resend.dev>',
                'to' => [$request->email],
                'subject' => 'CareMeds — Reset Your Password',
                'html' => '
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2a5298;">CareMeds Password Reset</h2>
                <p>You requested a password reset. Click the button below to set a new password.</p>
                <p>This link expires in <strong>15 minutes</strong>.</p>
                <a href="' . $resetUrl . '"
                   style="display:inline-block; padding: 12px 24px; background: linear-gradient(135deg, #1e3c72, #2a5298); color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
                   Reset Password
                </a>
                <p style="margin-top: 20px; color: #999; font-size: 13px;">
                    If you did not request this, ignore this email.
                </p>
            </div>
        ',
            ]);
        } else {
            // Fallback for local development — use Laravel Mail
            Mail::send([], [], function ($message) use ($request, $resetUrl) {
                $message
                    ->to($request->email)
                    ->subject('CareMeds — Reset Your Password')
                    ->setBody('
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px;">
                    <h2 style="color: #2a5298;">CareMeds Password Reset</h2>
                    <p>Click below to reset your password. Expires in 15 minutes.</p>
                    <a href="' . $resetUrl . '" style="display:inline-block; padding: 12px 24px; background: #2a5298; color: #fff; text-decoration: none; border-radius: 8px;">
                        Reset Password
                    </a>
                </div>
            ', 'text/html');
            });
        }

        return response()->json([
            'message' => 'If this email exists, a reset link has been sent.'
        ], 200);
    }

    // Step 2: User submits new password with token
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:6'
        ]);

        // Find the token record using Eloquent
        $record = PasswordResetToken::where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$record) {
            return response()->json([
                'message' => 'Invalid or expired reset link.'
            ], 422);
        }

        // Check token has not expired
        if (Carbon::now()->isAfter($record->expires_at)) {
            $record->delete();
            return response()->json([
                'message' => 'This reset link has expired. Please request a new one.'
            ], 422);
        }

        // Update the user's password using Eloquent
        $user = User::where('email', $request->email)->first();
        $user->update(['password' => Hash::make($request->password)]);

        // Delete the used token
        $record->delete();

        return response()->json([
            'message' => 'Password reset successfully. You can now log in.'
        ], 200);
    }
}