<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\EmailVerificationController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/medicines', [MedicineController::class, 'index']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password',  [PasswordResetController::class, 'resetPassword']);

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->name('verification.verify');

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/email/resend', [EmailVerificationController::class, 'sendVerificationEmail']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/my-orders', [OrderController::class, 'myOrders']);

    Route::post('/cart/add', [CartController::class, 'addToCart']);
    Route::put('/cart/update', [CartController::class, 'updateCart']);
    Route::delete('/cart/remove/{id}', [CartController::class, 'removeFromCart']);
    Route::delete('/cart/clear', [CartController::class, 'clearCart']); // ← ADD HERE
    Route::get('/cart', [CartController::class, 'getMyCart']);
    Route::get('/cart/list', [CartController::class, 'getMyCart']);
});
