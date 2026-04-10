<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StoryController;

Route::post('/stories/generate', [StoryController::class, 'generate']);