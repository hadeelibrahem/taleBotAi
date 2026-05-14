<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminLogController;
use App\Http\Controllers\AdminPaymentController;
use App\Http\Controllers\AdminStoryController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\StoryController;

Route::get('/admins/avatar/{path}', [AdminController::class, 'avatar'])->where('path', '.*');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/stories/generate', [StoryController::class, 'generate']);
});

Route::middleware(['auth:sanctum', 'admin.token'])->group(function () {
    Route::get('/admins', [AdminController::class, 'index']);
    Route::get('/admins/current', [AdminController::class, 'current']);
    Route::post('/admins/current', [AdminController::class, 'updateCurrent']);
    Route::patch('/admins/current', [AdminController::class, 'updateCurrent']);
    Route::patch('/admins/{admin}/role', [AdminController::class, 'updateRole']);
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);
    Route::get('/logs', [AdminLogController::class, 'index']);
    Route::delete('/logs', [AdminLogController::class, 'destroy']);
    Route::get('/payments', [AdminPaymentController::class, 'index']);
    Route::patch('/payments/plans/{plan}', [AdminPaymentController::class, 'updatePlanSettings']);
    Route::patch('/payments/users/{user}/plan', [AdminPaymentController::class, 'updatePlan']);
    Route::post('/payments/users/{user}/renew', [AdminPaymentController::class, 'renewSubscription']);
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{user}', [AdminUserController::class, 'show']);
    Route::patch('/users/{user}/status', [AdminUserController::class, 'updateStatus']);
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);
    Route::get('/stories', [AdminStoryController::class, 'storiesIndex']);
    Route::patch('/stories/{story}/status', [AdminStoryController::class, 'updateStoryStatus']);
    Route::get('/stories/images', [AdminStoryController::class, 'imagesIndex']);
    Route::patch('/stories/images/{storyPage}', [AdminStoryController::class, 'updateImageStatus']);
    Route::get('/stories/{story}', [AdminStoryController::class, 'show']);
});
