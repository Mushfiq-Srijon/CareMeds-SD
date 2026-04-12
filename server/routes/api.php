<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\PharmacyController;
use App\Http\Controllers\SteadfastController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AdminController;

// ── Public Routes ─────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

Route::get('/medicines', [MedicineController::class, 'index']);
Route::get('/medicines/{id}', [MedicineController::class, 'show']); // ✅ Task 5

Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->name('verification.verify');


Route::post('/payment/webhook', [PaymentController::class, 'webhook']);


// ── Protected Routes ──────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/email/resend', [EmailVerificationController::class, 'sendVerificationEmail']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    // Orders
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/my-orders', [OrderController::class, 'myOrders']);

    // Cart
    Route::post('/cart/add', [CartController::class, 'addToCart']);
    Route::put('/cart/update', [CartController::class, 'updateCart']);
    Route::delete('/cart/remove/{id}', [CartController::class, 'removeFromCart']);
    Route::delete('/cart/clear', [CartController::class, 'clearCart']);
    Route::get('/cart', [CartController::class, 'getMyCart']);
    Route::get('/cart/list', [CartController::class, 'getMyCart']);
    Route::post('/auth/google/set-role', [GoogleAuthController::class, 'setRole']);
    // Pharmacy
    Route::get('/pharmacy/profile', [PharmacyController::class, 'profile']);
    Route::post('/pharmacy/setup', [PharmacyController::class, 'setup']);
    Route::get('/pharmacy/medicines', [PharmacyController::class, 'medicines']);
    Route::get('/pharmacy/orders', [PharmacyController::class, 'orders']);
    Route::put('/pharmacy/orders/{id}/status', [OrderController::class, 'updateOrderStatus']);
    Route::get('/pharmacy/orders/{id}/items', [OrderController::class, 'orderItems']);
    // Medicine CRUD
    Route::post('/medicines', [MedicineController::class, 'store']);
    Route::put('/medicines/{id}', [MedicineController::class, 'update']);
    Route::delete('/medicines/{id}', [MedicineController::class, 'destroy']);
    // Invoice
    Route::get('/orders/{id}/invoice', [OrderController::class, 'invoiceData']);
    //Steadfast
    Route::post('/pharmacy/orders/{id}/dispatch', [SteadfastController::class, 'sendToSteadfast']);

    //Stripe
    Route::post('/payment/create-intent', [PaymentController::class, 'createIntent']);

    //location
    Route::get('/locations', [MedicineController::class, 'locations']);

    // Admin
    Route::get('/admin/stats', [AdminController::class, 'stats']);
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::get('/admin/pharmacies', [AdminController::class, 'pharmacies']);
    Route::get('/admin/orders', [AdminController::class, 'orders']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
    Route::delete('/admin/pharmacies/{id}', [AdminController::class, 'deletePharmacy']);
});