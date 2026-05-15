<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

//Route::middleware('auth:sanctum')->group(function () {

    //Route::get('/dashboard', [DashboardController::class, 'index']);
Route::get('/dashboard', [DashboardController::class, 'index']);

//});
