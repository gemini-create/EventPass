<?php

use App\Http\Controllers\AttendeeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckInController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::prefix('public')->group(function () {
    Route::get('/events/{slug}', [PublicController::class, 'showEvent']);
    Route::post('/events/{slug}/register', [PublicController::class, 'register'])
        ->middleware('throttle:20,1');
    Route::get('/tickets/{token}', [PublicController::class, 'ticket']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('events', EventController::class);
    Route::get('/events/{id}/attendees', [AttendeeController::class, 'index']);
    Route::get('/events/{id}/stats', [AttendeeController::class, 'stats']);
    Route::get('/events/{id}/export', [AttendeeController::class, 'export']);
    Route::post('/checkin', [CheckInController::class, 'store']);
});