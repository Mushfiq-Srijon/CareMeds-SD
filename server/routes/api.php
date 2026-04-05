<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\PharmacyController;

// ── Public Routes ─────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/medicines',     [MedicineController::class, 'index']);
Route::get('/medicines/{id}',[MedicineController::class, 'show']); // ✅ Task 5

Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password',  [PasswordResetController::class, 'resetPassword']);

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->name('verification.verify');

// ── Protected Routes ──────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/email/resend', [EmailVerificationController::class, 'sendVerificationEmail']);

    // Orders
    Route::post('/orders',   [OrderController::class, 'store']);
    Route::get('/my-orders', [OrderController::class, 'myOrders']);

    // Cart
    Route::post('/cart/add',           [CartController::class, 'addToCart']);
    Route::put('/cart/update',         [CartController::class, 'updateCart']);
    Route::delete('/cart/remove/{id}', [CartController::class, 'removeFromCart']);
    Route::delete('/cart/clear',       [CartController::class, 'clearCart']);
    Route::get('/cart',                [CartController::class, 'getMyCart']);
    Route::get('/cart/list',           [CartController::class, 'getMyCart']);

    // Pharmacy
    Route::get('/pharmacy/profile',   [PharmacyController::class, 'profile']);
    Route::post('/pharmacy/setup',    [PharmacyController::class, 'setup']);
    Route::get('/pharmacy/medicines', [PharmacyController::class, 'medicines']);
    Route::get('/pharmacy/orders',    [PharmacyController::class, 'orders']);
    Route::put('/pharmacy/orders/{id}/status', [OrderController::class, 'updateOrderStatus']);
Route::get('/pharmacy/orders/{id}/items', [OrderController::class, 'orderItems']);
    // Medicine CRUD
    Route::post('/medicines',        [MedicineController::class, 'store']);
    Route::put('/medicines/{id}',    [MedicineController::class, 'update']);
    Route::delete('/medicines/{id}', [MedicineController::class, 'destroy']);
});
