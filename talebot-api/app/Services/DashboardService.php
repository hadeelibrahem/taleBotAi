<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\ChildProfile;
use App\Models\PremiumSetting;
use App\Models\Story;
use App\Models\StoryProgress;
use App\Models\StoryRating;
use App\Models\User;

class DashboardService
{
    public function getDashboardData(int $userId): array
    {
        $user = User::findOrFail($userId);

        $childIds = ChildProfile::where('user_id', $userId)->pluck('id');
 
        return [
            'user_card' => $this->getUserCard($user, $childIds),
            'hero_section' => $this->getHeroSection($childIds, $user->name),
            'stats' => $this->getStats($userId, $childIds),
            'continue_reading' => $this->getContinueReading($childIds),
            'recent_activities' => $this->getRecentActivities($userId),
            'insights' => $this->getInsights($userId, $childIds),
            'notifications' => $this->getNotifications($userId),
        ];
    }

    private function getUserCard(User $user, $childIds): array
    {
        $hasPremium = PremiumSetting::whereIn('child_id', $childIds)->exists();

        return [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => null,
            'plan' => $hasPremium ? 'Premium Plan' : 'Free Plan',
        ];
    }

    private function getHeroSection($childIds, string $userName): array
    {
        $storiesCount = Story::whereIn('child_id', $childIds)->count();

        return [
            'badge' => 'AI-Powered Stories',
            'title' => "Good evening, {$userName}!",
            'subtitle' => "You've crafted {$storiesCount} enchanting tales this month. Ready to dream up another magical bedtime story?",
            'actions' => [
                [
                    'label' => 'Create New Story',
                    'type' => 'primary',
                    'path' => '/create-story',
                ],
                [
                    'label' => 'View All Stories',
                    'type' => 'secondary',
                    'path' => '/my-stories',
                ],
            ],
        ];
    }

    private function getStats(int $userId, $childIds): array
    {
        $storiesCreated = Story::whereIn('child_id', $childIds)->count();

        $readingTimeMinutes = StoryProgress::whereIn('child_id', $childIds)
            ->sum('reading_time_minutes');

        $favoriteGenre = Story::whereIn('child_id', $childIds)
            ->select('genre')
            ->groupBy('genre')
            ->orderByRaw('COUNT(*) DESC')
            ->value('genre');

        $totalProgressRecords = StoryProgress::whereIn('child_id', $childIds)->count();

        $completedRecords = StoryProgress::whereIn('child_id', $childIds)
            ->where('progress_percentage', 100)
            ->count();

        $completionRate = $totalProgressRecords > 0
            ? round(($completedRecords / $totalProgressRecords) * 100)
            : 0;

        $avgRating = StoryRating::whereIn('child_id', $childIds)->avg('rating');
        $avgRating = $avgRating ? round($avgRating, 1) : 0;

        return [
            'stories_created' => $storiesCreated,
            'reading_time_minutes' => (int) $readingTimeMinutes,
            'favorite_genre' => $favoriteGenre ?? 'N/A',
            'completion_rate' => $completionRate,
            'avg_rating' => $avgRating,
        ];
    }

    private function getContinueReading($childIds): array
    {
        return Story::with(['childProfile', 'progress'])
            ->whereIn('child_id', $childIds)
            ->latest()
            ->take(4)
            ->get()
            ->map(function (Story $story) {
                $progress = $story->progress()->latest()->first();

                return [
                    'id' => $story->id,
                    'title' => $story->title,
                    'genre' => $story->genre,
                    'cover_image' => $story->cover_image,
                    'child_name' => $story->childProfile?->name,
                    'progress_percentage' => $progress?->progress_percentage ?? 0,
                    'reading_time_minutes' => $progress?->reading_time_minutes ?? 0,
                    'last_read_at' => $progress?->last_read_at,
                ];
            })
            ->values()
            ->toArray();
    }

    private function getRecentActivities(int $userId): array
    {
        return Activity::with(['story', 'childProfile'])
            ->where('user_id', $userId)
            ->latest()
            ->take(5)
            ->get()
            ->map(function (Activity $activity) {
                return [
                    'id' => $activity->id,
                    'activity_type' => $activity->activity_type,
                    'description' => $activity->description,
                    'story_title' => $activity->story?->title,
                    'child_name' => $activity->childProfile?->name,
                    'time_ago' => $activity->created_at?->diffForHumans(),
                    'created_at' => $activity->created_at,
                ];
            })
            ->values()
            ->toArray();
    }

    private function getInsights(int $userId, $childIds): array
    {
        $popularGenre = Story::whereIn('child_id', $childIds)
            ->select('genre')
            ->groupBy('genre')
            ->orderByRaw('COUNT(*) DESC')
            ->value('genre');

        $topRatedStory = Story::whereIn('child_id', $childIds)
            ->withAvg('ratings', 'rating')
            ->orderByDesc('ratings_avg_rating')
            ->first();

        return [
            [
                'title' => 'Most Popular Theme',
                'content' => $popularGenre
                    ? "Your most popular genre right now is {$popularGenre}."
                    : 'No story data yet.',
            ],
            [
                'title' => 'Suggested Moral',
                'content' => $topRatedStory
                    ? "Stories like \"{$topRatedStory->title}\" are performing well. Try a moral about kindness, courage, or friendship."
                    : 'Try adding a moral lesson like kindness creates lasting friendships.',
            ],
        ];
    }
    private function getNotifications(int $userId): array
{
    return \App\Models\Notification::where('user_id', $userId)
        ->where('is_read', false)
        ->latest()
        ->take(10)
        ->get()
        ->toArray();
}
}
