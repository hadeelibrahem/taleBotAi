<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ChildProfile;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboardService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user->id;

        $data = $this->dashboardService->getDashboardData($userId);

        $notifications = DB::table('notifications')
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                ];
            })
            ->toArray();

        $data['notifications'] = $notifications;

        return response()->json([
            'message' => 'Dashboard fetched successfully.',
            'data' => $data,
        ]);
    }

    public function childDashboard($id): JsonResponse
    {
        $child = ChildProfile::findOrFail($id);

        $stories = DB::table('stories')
            ->where('child_id', $child->id)
            ->latest()
            ->get();

        $progress = DB::table('story_progress')
            ->where('child_id', $child->id)
            ->get();

        $ratings = DB::table('story_ratings')
            ->where('child_id', $child->id)
            ->get();

        $activities = DB::table('activities')
            ->leftJoin('stories', 'activities.story_id', '=', 'stories.id')
            ->where('activities.child_id', $child->id)
            ->select(
                'activities.id',
                'activities.activity_type',
                'activities.description',
                'activities.created_at',
                'stories.title as story_title'
            )
            ->orderByDesc('activities.created_at')
            ->limit(5)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'activity_type' => $activity->activity_type,
                    'description' => $activity->description,
                    'story_title' => $activity->story_title,
                    'time_ago' => \Carbon\Carbon::parse($activity->created_at)->diffForHumans(),
                ];
            });

        $totalReadingTime = $progress->sum('reading_time_minutes');
        $avgRating = $ratings->avg('rating') ?? 0;

        $favoriteGenre = $stories
            ->groupBy('genre')
            ->sortByDesc(fn($group) => $group->count())
            ->keys()
            ->first() ?? 'Adventure';

        $continueReading = $stories->map(function ($story) use ($progress, $child) {
            $storyProgress = $progress->firstWhere('story_id', $story->id);

            return [
                'id' => $story->id,
                'title' => $story->title,
                'genre' => $story->genre,
                'cover_image' => $story->cover_image,
                'child_name' => $child->name,
                'progress_percentage' => $storyProgress->progress_percentage ?? 0,
            ];
        });

        $completionRate = $progress->count() > 0
            ? round(
                $progress->where('progress_percentage', '>=', 100)->count()
                / $progress->count() * 100
            )
            : 0;

        $insights = [
            [
                'title' => 'Most Popular Theme',
                'content' => 'Your most popular genre right now is ' . $favoriteGenre . '.',
            ],
            [
                'title' => 'Suggested Moral',
                'content' => 'Stories are performing well. Try a moral about kindness, courage, or friendship.',
            ],
        ];

        return response()->json([
            'message' => 'Child dashboard fetched successfully',
            'data' => [
                'hero_section' => [
                    'badge' => 'Child Mode',
                    'title' => 'Welcome ' . $child->name . $child->avatar,
                    'subtitle' => 'Create, read, and enjoy your own stories.',
                    'actions' => [
                        ['label' => 'Create Story'],
                        ['label' => 'My Stories'],
                    ],
                ],

                'stats' => [
                    'stories_created' => $stories->count(),
                    'reading_time_minutes' => $totalReadingTime,
                    'favorite_genre' => $favoriteGenre,
                    'completion_rate' => $completionRate,
                    'avg_rating' => round($avgRating, 1),
                ],

                'continue_reading' => $continueReading,
                'recent_activities' => $activities,
                'notifications' => [],
                'insights' => $insights,
            ],
        ]);
    }
}