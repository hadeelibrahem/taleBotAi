<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Models\ChildProfile;
use App\Models\Story;
use App\Models\StoryProgress;
use App\Models\Favorite;
use App\Models\Activity;
use App\Models\AiInsight;
use App\Models\PremiumSetting;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    public function show($userId , $childId){

    $user = User::findOrFail($userId);

    return $this->profilePayload($user, (int) $childId);
     }

    public function current(Request $request, $childId): JsonResponse
    {
        return $this->profilePayload($request->user(), (int) $childId);
    }

    private function profilePayload(User $user, int $childId): JsonResponse
    {
    $child = ChildProfile::where('user_id', $user->id)
        ->where('id', $childId)
        ->firstOrFail();
    $storiesCount = Story::where('child_id', $child->id)->count();
    $readingTime = StoryProgress::where('child_id',$child->id)->sum('reading_time_minutes');
    $completedStories = StoryProgress::where('child_id',$child->id)->where('progress_percentage',100)->count();
    $faveGenre = Story::where('child_id',$child->id)->selectRaw('genre, COUNT(*) as total')->groupBy('genre')->orderByDesc('total')->value('genre') ?? 'Not set';
    $storiesInProgress = StoryProgress::where('child_id',$child->id)->where('progress_percentage','>',0)->where('progress_percentage','<',100)->count();
    $weeklyGoalCurrent = StoryProgress::where('child_id', $child->id)->whereBetween('last_read_at', [Carbon::now()->startOfWeek(),Carbon::now()->endOfWeek()])->count();
    $aiInsight = AiInsight::where('user_id', $user->id)->where('child_id', $child->id)->latest()->first();
    $completionRate = $aiInsight?->completion_rate ?? 0;
    $avgRating = $aiInsight?->avg_rating ?? 0;
    $favoriteStories = Favorite::where('child_id',$child->id)->with('story')->take(3)->get()->map(function ($favorite) {
        return [
            'title' => $favorite->story?->title,
            'genre' => $favorite->story?->genre,
            'cover' => $favorite->story?->cover_image ?? 'default.jpg',
        ];
    });
    $latestActivity = Activity::where('user_id', $user->id)->where('child_id', $child->id)->latest()->first();
    $latestActivityData = [
    'title' => 'Last Activity',
    'description' => $latestActivity?->description ?? 'No recent activity found.',
    'time' => $latestActivity?->created_at?->diffForHumans() ?? 'No activity yet',
        ];
    $premiumSetting = PremiumSetting::where('child_id', $child->id)->first();
    $plan = $premiumSetting ? 'Premium' : 'Standard';
    $safeContent = $premiumSetting && $premiumSetting->safe_content_filter ? 'Enabled': 'Disabled';
    $avatar = $child->avatar ?? 'default-avatar.jpg';
    $memberSince = $user->created_at?->format('F Y') ?? 'Not available';
    $popularTheme = $aiInsight?->popular_theme ?? 'Not available';
    $suggestedMoral = $aiInsight?->suggested_moral ?? 'Not available';


  $weeklyGoalTarget = 5;
  return response()->json([
  'name' => $user->name ,
  'child_name' => $child->name,
  'stories' => $storiesCount,
  'readingTime' =>$readingTime,
  'completedStories' => $completedStories,
  'favGenre' => $faveGenre,
  'storiesInProgress' => $storiesInProgress,
  'weeklyGoal' => ['current' => $weeklyGoalCurrent,'target' => $weeklyGoalTarget],
  'completionRate' => $completionRate,
  'avgRating' => $avgRating,  
  'favoriteStories' => $favoriteStories,
  'latestActivity' => $latestActivityData,
  'plan' => $plan,
  'safeContent' => $safeContent,
  'avatar' => $avatar,
  'memberSince' => $memberSince,
  'popularTheme' => $popularTheme,
  'suggestedMoral' => $suggestedMoral,
  ]);
    }
}
