<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    // Line 10: Called when user clicks "Login with Google"
    // Redirects the user to Google's login page
  public function redirect()
    {
        $url = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();
        return response()->json(['url' => $url]);
    }

    // Line 18: Called by Google after user logs in
    // Google sends back user info to this URL
    public function callback(Request $request)
    {
        // Line 22: Get the user info from Google using the code Google sent back
        $googleUser = Socialite::driver('google')->stateless()->user();

        // Line 25: Check if a user with this email already exists in our database
        $user = User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            // Line 29: User already exists — just log them in
            // Mark email as verified if not already (since Google already verified it)
            if (!$user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
            }

            // Line 34: Check if this existing user has a role yet
            // If no role, send them to role selection screen
            if (!$user->role) {
                $tempToken = $user->createToken('temp-token')->plainTextToken;
                return redirect(env('FRONTEND_URL') . '/select-role?token=' . $tempToken);
            }

            // Line 40: User has a role — create a Sanctum token and redirect to frontend
            $token = $user->createToken('api-token')->plainTextToken;
            return redirect(env('FRONTEND_URL') . '/oauth/callback?token=' . $token . '&name=' . urlencode($user->name) . '&role=' . $user->role . '&id=' . $user->id);

        } else {
            // Line 45: Brand new user — create them in the database
            // We don't set role yet — they will choose on the next screen
            $user = User::create([
                'name'              => $googleUser->getName(),
                'email'             => $googleUser->getEmail(),
                'password'          => bcrypt(\Illuminate\Support\Str::random(24)),
                'email_verified_at' => now(), // Google already verified the email
                'role'              => null,  // No role yet — they will pick it
            ]);

            // Line 53: Create a temporary token and send them to role selection screen
            $tempToken = $user->createToken('temp-token')->plainTextToken;
            return redirect(env('FRONTEND_URL') . '/select-role?token=' . $tempToken);
        }
    }

    // Line 58: Called from the role selection screen after user picks their role
    // Saves the role and returns a proper token
    public function setRole(Request $request)
    {
        $request->validate([
            'role' => 'required|in:customer,pharmacy,rider'
        ]);

        // Line 64: Get the currently authenticated user (using the temp token)
        $user = Auth::user();

        // Line 67: Save their chosen role
        $user->update(['role' => $request->role]);

        // Line 70: Delete all old tokens and create a fresh proper token
        $user->tokens()->delete();
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'   => $user->id,
                'name' => $user->name,
                'role' => $user->role,
            ]
        ]);
    }
}