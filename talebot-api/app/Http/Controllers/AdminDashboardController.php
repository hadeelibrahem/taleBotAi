<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Models\StoryPage;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class AdminDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $this->stats(),
                'storyTrend' => $this->storyTrend(),
                'recentAlerts' => $this->recentAlerts(),
                'recentStories' => $this->recentStories(),
                'recentUsers' => $this->recentUsers(),
            ],
        ]);
    }

    private function stats(): array
    {
        $totalUsers = User::query()->count();
        $premiumUsers = User::query()->whereIn('plan', ['premium', 'unlimited'])->count();
        $totalStories = Story::query()->count();
        $pendingStories = Story::query()->where(fn ($query) => $query
            ->where('status', 'Pending')
            ->orWhereNull('status')
        )->count();
        $generatedImages = StoryPage::query()
            ->whereNotNull('image_url')
            ->where('image_url', '!=', '')
            ->count();
        $apiErrors = collect($this->readLogEntries())
            ->filter(fn ($entry) => Str::contains($entry, ['.ERROR:', '.CRITICAL:', '.ALERT:', '.EMERGENCY:']))
            ->count();

        return [
            'totalUsers' => $totalUsers,
            'premiumUsers' => $premiumUsers,
            'totalStories' => $totalStories,
            'pendingStories' => $pendingStories,
            'generatedImages' => $generatedImages,
            'apiErrors' => $apiErrors,
        ];
    }

    private function storyTrend(): array
    {
        $start = Carbon::today()->subDays(44);
        $end = Carbon::today();

        $storyCounts = Story::query()
            ->whereDate('created_at', '>=', $start)
            ->selectRaw('DATE(created_at) as story_date, COUNT(*) as total')
            ->groupBy('story_date')
            ->pluck('total', 'story_date');

        $imageCounts = StoryPage::query()
            ->whereDate('story_pages.created_at', '>=', $start)
            ->whereNotNull('image_url')
            ->where('image_url', '!=', '')
            ->selectRaw('DATE(story_pages.created_at) as image_date, COUNT(*) as total')
            ->groupBy('image_date')
            ->pluck('total', 'image_date');

        $userCounts = User::query()
            ->whereDate('created_at', '>=', $start)
            ->selectRaw('DATE(created_at) as user_date, COUNT(*) as total')
            ->groupBy('user_date')
            ->pluck('total', 'user_date');

        $previousActivity = 1;

        return collect(CarbonPeriod::create($start, $end))
            ->map(function (Carbon $date) use ($storyCounts, $imageCounts, $userCounts, &$previousActivity) {
                $key = $date->toDateString();
                $stories = (int) ($storyCounts[$key] ?? 0);
                $images = (int) ($imageCounts[$key] ?? 0);
                $users = (int) ($userCounts[$key] ?? 0);
                $activityScore = max(0, ($stories * 3) + $images + ($users * 2));
                $open = $previousActivity;
                $close = max($activityScore, 1);
                $high = max($open, $close) + max(1, $images);
                $low = max(0, min($open, $close) - max(1, $users));

                $previousActivity = $close;

                return [
                    'date' => $key,
                    'label' => $date->format('M j'),
                    'count' => $stories,
                    'images' => $images,
                    'users' => $users,
                    'open' => $open,
                    'high' => $high,
                    'low' => $low,
                    'close' => $close,
                    'direction' => $close >= $open ? 'up' : 'down',
                ];
            })
            ->values()
            ->all();
    }

    private function recentAlerts(): array
    {
        return collect($this->readLogEntries())
            ->reverse()
            ->map(fn (string $entry, int $index) => $this->formatAlert($entry, $index))
            ->filter()
            ->reject(fn (array $alert) => $alert['isToolingNoise'])
            ->take(4)
            ->map(fn (array $alert) => collect($alert)->except('isToolingNoise')->all())
            ->values()
            ->all();
    }

    private function recentStories(): array
    {
        return Story::query()
            ->leftJoin('users', 'stories.user_id', '=', 'users.id')
            ->orderByDesc('stories.created_at')
            ->limit(5)
            ->get([
                'stories.id',
                'stories.title',
                'stories.genre',
                'stories.status',
                'stories.created_at',
                'users.full_name as user_name',
                'users.email as user_email',
            ])
            ->map(fn ($story) => [
                'id' => $story->id,
                'title' => $story->title,
                'genre' => $story->genre,
                'author' => $story->user_name ?: $story->user_email,
                'status' => $story->status ?: 'Pending',
                'createdAt' => optional($story->created_at)?->diffForHumans(),
            ])
            ->values()
            ->all();
    }

    private function recentUsers(): array
    {
        return User::query()
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'full_name', 'email', 'plan', 'status', 'created_at'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->full_name ?: $user->email,
                'email' => $user->email,
                'plan' => ucfirst($user->plan ?: 'free'),
                'status' => $user->status ?: 'Active',
                'joinedAt' => optional($user->created_at)?->diffForHumans(),
            ])
            ->values()
            ->all();
    }

    private function readLogEntries(): array
    {
        $path = storage_path('logs/laravel.log');

        if (! File::exists($path)) {
            return [];
        }

        $content = trim(File::get($path));

        if ($content === '') {
            return [];
        }

        return preg_split('/\R(?=\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\])/', $content) ?: [];
    }

    private function formatAlert(string $entry, int $index): ?array
    {
        if (! preg_match('/^\[(?<time>[^\]]+)\]\s+(?<environment>[^.]+)\.(?<level>[A-Z]+):\s+(?<body>.*)$/s', $entry, $matches)) {
            return null;
        }

        $body = trim($matches['body']);
        $contextPosition = strpos($body, ' {"');
        $message = $contextPosition === false ? $body : trim(substr($body, 0, $contextPosition));
        $source = $this->sourceFromBody($body);

        return [
            'id' => md5($matches['time'].$matches['level'].$index.$message),
            'type' => ucfirst(strtolower($matches['level'])),
            'source' => $source,
            'detail' => Str::limit($message, 120),
            'time' => Carbon::parse($matches['time'])->diffForHumans(),
            'isToolingNoise' => $source === 'Laravel Tinker'
                || Str::contains($body, ['PsySH', 'psysh_history', 'T_NS_SEPARATOR']),
        ];
    }

    private function sourceFromBody(string $body): string
    {
        if (preg_match('/\((?<class>[A-Za-z0-9_\\\\]+)\(code:/', $body, $matches)) {
            return class_basename($matches['class']);
        }

        if (Str::contains($body, ['Gemini', 'GEMINI'])) {
            return 'Gemini API';
        }

        if (Str::contains($body, ['Leonardo', 'LEONARDO'])) {
            return 'Leonardo API';
        }

        if (Str::contains($body, ['SQLSTATE', 'database', 'Database'])) {
            return 'Database';
        }

        if (Str::contains($body, ['Tinker', 'PsySH', 'psysh'])) {
            return 'Laravel Tinker';
        }

        return 'Laravel';
    }
}
