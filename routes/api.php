<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\FarmerController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\TrackingController;
use App\Http\Controllers\Api\V1\TranslationController;
use App\Http\Middleware\DemoAuthMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // ── Public: Auth ─────────────────────────────────────────────────────────
    Route::post('/auth/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Translation Route for Mobile App
    Route::get('/translations', [TranslationController::class, 'index']);

    // ── Demo Authentication Middleware ──
    // Because the mobile app is in demo mode and doesn't generate real Sanctum tokens,
    // we bypass Sanctum by automatically authenticating the user via the phone number stored in AsyncStorage.

    // ── Protected Routes ──
    Route::middleware([DemoAuthMiddleware::class])->group(function () {

        // Current user info
        Route::get('/user', fn (Request $request) => $request->user());

        // Employee endpoints
        Route::prefix('employee')->group(function () {
            Route::get('/dashboard', [EmployeeController::class, 'dashboard']);
            Route::get('/performance', [EmployeeController::class, 'performance']);
            Route::get('/tasks', [EmployeeController::class, 'tasks']);
            Route::post('/tasks/{id}/status', [EmployeeController::class, 'updateTaskStatus']);
            Route::get('/sites', [EmployeeController::class, 'sites']);
            Route::get('/farmers', [EmployeeController::class, 'myFarmers']);
            Route::get('/visits', [EmployeeController::class, 'visits']);
            Route::post('/attendance', [EmployeeController::class, 'attendance']);
            Route::post('/location-ping', [EmployeeController::class, 'locationPing']);
            Route::post('/farmer/register', [EmployeeController::class, 'registerFarmer']);
            Route::post('/visit/submit', [EmployeeController::class, 'submitVisit']);
            Route::post('/reports', [EmployeeController::class, 'submitVisit']);
            Route::post('/visit/{id}/checkout', [EmployeeController::class, 'checkoutVisit']);

            // Tracking endpoints
            Route::prefix('tracking')->group(function () {
                Route::post('/session/start', [TrackingController::class, 'startSession']);
                Route::post('/session/stop', [TrackingController::class, 'stopSession']);
                Route::post('/sync', [TrackingController::class, 'sync']);
            });
        });

        // Farmer endpoints
        Route::prefix('farmer')->group(function () {
            Route::get('/dashboard', [FarmerController::class, 'dashboard']);
            Route::get('/visits', [FarmerController::class, 'visits']);
            Route::post('/visit/{id}/rate', [FarmerController::class, 'rateVisit']);
            Route::get('/orders', [OrderController::class, 'index']);
            Route::get('/products', [ProductController::class, 'index']);
        });

        // Admin endpoints
        Route::prefix('admin')->group(function () {
            Route::get('/farmers/pending', [AdminController::class, 'pending']);
            Route::post('/farmers/{id}/approve', [AdminController::class, 'approveFarmer']);
        });
    });

    // Field registration endpoint (accessible with or without token for testing/demo)
    Route::post('/employee/farmer/register', [EmployeeController::class, 'registerFarmer']);
});
