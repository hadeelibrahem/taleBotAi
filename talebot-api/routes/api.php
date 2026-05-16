<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AuthController;

use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\StoryViewController;
use App\Http\Controllers\StoryController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\StoryRatingController;
use App\Http\Controllers\StoryProgressController;
use App\Http\Controllers\StoryPageController;
use App\Http\Controllers\CartoonVoiceController;
use App\Http\Controllers\ProfileController;

  Route::middleware('auth:sanctum')->group(function () {
    Route::get('/analytics/children', [AnalyticsController::class, 'getChildren']);
    Route::get('/analytics/{childId}', [AnalyticsController::class, 'getAnalytics']);
    Route::get('/profile/{childId}', [ProfileController::class, 'current']);
});
//Route::middleware('auth:sanctum')->group(function () {

    //Route::get('/dashboard', [DashboardController::class, 'index']);
Route::middleware('auth:sanctum')->get('/dashboard', [DashboardController::class, 'index']);

Route::get('/children/{id}/dashboard', [DashboardController::class, 'childDashboard']);


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::middleware(['auth:sanctum', 'admin.token'])->group(function () {
    Route::post('/admin/register', [AdminAuthController::class, 'register']);
    Route::get('/admin/me', [AdminAuthController::class, 'current']);
    Route::post('/admin/logout', [AdminAuthController::class, 'logout']);
});





Route::get('/password/reset/{token}', function ($token) {
    return redirect('http://localhost:3000/?token=' . $token . '&email=' . request('email'));
})->name('password.reset');

Route::middleware('auth:sanctum')->get('/user', function (Request $request) { return $request->user(); });

//tala
Route::get('/children/{id}/stories',[StoryViewController::class,'childStories'])->whereNumber('id');
Route::get('/children/{childId}/stories/{storyId}', [StoryViewController::class, 'showForChild'])
    ->whereNumber('childId')
    ->whereNumber('storyId');
Route::get('/stories',[StoryViewController::class,'index']);
Route::get('/stories/{id}', [StoryViewController::class, 'show'])->whereNumber('id');

require __DIR__.'/hadeelRoutes.php';


//Route::get('/stories',[StoryViewController::class,'index']);

//Route::post('/children/{id}/login', [SettingsController::class, 'loginChild']);
Route::get('/plans', [SettingsController::class, 'plans']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::put('/settings/account', [SettingsController::class, 'updateAccount']);
    Route::put('/settings/preferences', [SettingsController::class, 'updatePreferences']);
Route::post('/subscription/checkout', [SettingsController::class, 'checkoutSubscription']);
    Route::post('/settings/children', [SettingsController::class, 'storeChild']);
    Route::put('/settings/children/{id}', [SettingsController::class, 'updateChild']);
    Route::delete('/settings/children/{id}', [SettingsController::class, 'deleteChild']);

    Route::delete('/settings/account/delete', [SettingsController::class, 'deleteAccount']);
    Route::post('/children/{id}/login', [SettingsController::class, 'loginChild']);
});

Route::post('/favorites', [FavoriteController::class, 'store']);
Route::delete('/favorites/{child_id}/{story_id}', [FavoriteController::class, 'destroy']);

Route::post('/story-ratings', [StoryRatingController::class, 'store']);

Route::post('/progress', [StoryProgressController::class, 'store']);
Route::post('/progress/reset', [StoryProgressController::class, 'reset']);
Route::get('/progress/{child_id}/{story_id}', [StoryProgressController::class, 'show']);

Route::get('/favorites/check/{child_id}/{story_id}', [FavoriteController::class, 'check']);
Route::put('/story-pages/{id}', [StoryPageController::class, 'update']);

Route::middleware('auth:sanctum')->post('/cartoon-voice', [CartoonVoiceController::class,'generate']);

Route::get('profile/{userid}/{childid}', [ProfileController::class, 'show']);
