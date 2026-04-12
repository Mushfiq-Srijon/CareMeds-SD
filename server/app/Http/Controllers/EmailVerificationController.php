<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;
use App\Models\User;

class EmailVerificationController extends Controller
{
    // Step 1: Send verification email
    // This is called automatically after registration
    public function sendVerificationEmail(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.'
            ], 200);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification link sent to your email.'
        ], 200);
    }

    // Step 2: Handle the verification link click
    // User clicks the link in their email and lands here
    public function verify(Request $request, $id, $hash)
    {
        // Find the user by ID
        $user = User::findOrFail($id);

        // Check the hash matches — security check
        if (!hash_equals(
            (string) $hash,
            sha1($user->getEmailForVerification())
        )) {
            return response()->json([
                'message' => 'Invalid verification link.'
            ], 403);
        }

        // Check if already verified
        if ($user->hasVerifiedEmail()) {
            // Redirect to frontend login page
            return redirect(env('FRONTEND_URL') . '/login?verified=already');
        }

        // Mark email as verified
        $user->markEmailAsVerified();
        event(new Verified($user));

        // Redirect to frontend login page with success message
        return redirect(env('FRONTEND_URL') . '/login?verified=1');
    }
}