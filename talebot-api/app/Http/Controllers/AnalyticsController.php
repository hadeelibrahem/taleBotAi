<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ChildProfile;
use App\Models\Story;
use App\Models\StoryProgress;
use App\Models\Activity;
use App\Models\AiInsight;

class AnalyticsController extends Controller
{
   

    public function getChildren(Request $request)
    {
 $user = (object) ['id' => 1];
       // $user = $request->user();

        $children = ChildProfile::where('user_id', $user->id)
            ->get(['id', 'name', 'age', 'avatar']);

        return response()->json($children);
    }

    public function getAnalytics(Request $request, $childId)
    {
        //$user = $request->user();
 $user = (object) ['id' => 1];

        $child = ChildProfile::where('id', $childId)
            ->where('user_id', $user->id)
            ->firstOrFail();

      
        $storiesCount = Story::where('child_id', $childId)->count();

        $totalMinutes = StoryProgress::where('child_id', $childId)
            ->sum('reading_time_minutes');

        $hours   = intdiv($totalMinutes, 60);
        $minutes = $totalMinutes % 60;
        $readingTime = "{$hours}h {$minutes}m";

        $topGenre = Story::where('child_id', $childId)
            ->selectRaw('genre, count(*) as cnt')
            ->groupBy('genre')
            ->orderByDesc('cnt')
            ->value('genre') ?? 'N/A';

        $avgProgress = StoryProgress::where('child_id', $childId)
            ->avg('progress_percentage') ?? 0;

        $insight = AiInsight::where('child_id', $childId)
            ->latest()
            ->first();

        
        $weeklyActivity = [];
        for ($i = 3; $i >= 0; $i--) {
            $start = now()->subWeeks($i)->startOfWeek();
            $end   = now()->subWeeks($i)->endOfWeek();

            $weeklyActivity[] = Activity::where('child_id', $childId)
                ->whereBetween('created_at', [$start, $end])
                ->count();
        }

        return response()->json([
            'child' => [
                'id'     => $child->id,
                'name'   => $child->name,
                'age'    => $child->age,
                'avatar' => $child->avatar,
            ],
            'stats' => [
                'stories_count'  => $storiesCount,
                'reading_time'   => $readingTime,
                'top_genre'      => $topGenre,
                'avg_progress'   => round($avgProgress) . '%',
            ],
            'weekly_activity' => $weeklyActivity,   // [week1, week2, week3, week4]
            'insight' => $insight ? [
                'popular_theme'   => $insight->popular_theme,
                'suggested_moral' => $insight->suggested_moral,
                'completion_rate' => $insight->completion_rate,
                'avg_rating'      => $insight->avg_rating,
            ] : null,
        ]);
    }
}