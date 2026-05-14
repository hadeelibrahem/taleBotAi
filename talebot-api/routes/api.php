<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::post('/admin/register', [AdminAuthController::class, 'register']);
Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::middleware(['auth:sanctum', 'admin.token'])->group(function () {
    Route::get('/admin/me', [AdminAuthController::class, 'current']);
    Route::post('/admin/logout', [AdminAuthController::class, 'logout']);
});

Route::get('/password/reset/{token}', function ($token) {
    return redirect('http://localhost:3000/?token=' . $token . '&email=' . request('email'));
})->name('password.reset');

Route::middleware('auth:sanctum')->get('/user', function (Request $request) { return $request->user(); });

require __DIR__.'/hadeelRoutes.php';
