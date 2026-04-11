<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Auth;
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/password/reset/{token}', function ($token) {
    return redirect('http://localhost:3000/?token=' . $token . '&email=' . request('email'));
})->name('password.reset');

Route::middleware('auth:sanctum')->get('/user', function (Request $request) { return $request->user(); });