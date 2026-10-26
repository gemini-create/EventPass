<?php

use App\Http\Controllers\AttendeeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckInController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PasswordResetController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/forgot-password', [PasswordResetController::class, 'forgot'])->middleware('throttle:5,1');
Route::post('/reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:10,1');

Route::prefix('public')->group(function () {
    Route::get('/events/{slug}', [PublicController::class, 'showEvent']);
    Route::post('/events/{slug}/register', [PublicController::class, 'register'])
        ->middleware('throttle:20,1');
    Route::get('/tickets/{token}', [PublicController::class, 'ticket']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin and staff
    Route::middleware('role:admin,staff')->group(function () {
        Route::get('/events', [EventController::class, 'index']);
        Route::get('/events/{id}/stats', [AttendeeController::class, 'stats']);
        Route::post('/checkin', [CheckInController::class, 'store']);
    });

    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::post('/events', [EventController::class, 'store']);
        Route::get('/events/{id}', [EventController::class, 'show']);
        Route::put('/events/{id}', [EventController::class, 'update']);
        Route::delete('/events/{id}', [EventController::class, 'destroy']);
        Route::get('/events/{id}/attendees', [AttendeeController::class, 'index']);
        Route::get('/events/{id}/export', [AttendeeController::class, 'export']);

        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
    });
});