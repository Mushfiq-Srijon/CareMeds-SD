<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Webhook;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    // POST /api/payment/create-intent
    public function createIntent(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        // Convert BDT to USD cents (1 USD ≈ 110 BDT, adjust as needed)
        $amountInBDT  = $request->amount;
        $amountInUSD  = $amountInBDT / 110;
        $amountInCents = (int) round($amountInUSD * 100);

        $intent = PaymentIntent::create([
            'amount'   => $amountInCents,
            'currency' => 'usd',
            'metadata' => [
                'user_id'      => Auth::id(),
                'amount_bdt'   => $amountInBDT,
            ],
        ]);

        return response()->json([
            'client_secret'      => $intent->client_secret,
            'payment_intent_id'  => $intent->id,
        ]);
    }

    // POST /api/payment/webhook  (no auth middleware)
    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        if ($event->type === 'payment_intent.succeeded') {
            $intentId = $event->data->object->id;
            \DB::update(
                'UPDATE orders SET payment_status = ? WHERE stripe_payment_intent_id = ?',
                ['paid', $intentId]
            );
        }

        if ($event->type === 'payment_intent.payment_failed') {
            $intentId = $event->data->object->id;
            \DB::update(
                'UPDATE orders SET payment_status = ? WHERE stripe_payment_intent_id = ?',
                ['failed', $intentId]
            );
        }

        return response()->json(['received' => true]);
    }
}