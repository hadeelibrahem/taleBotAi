<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->withCount(['stories', 'childProfiles'])
            ->withCount([
                'stories as images_count' => function ($query) {
                    $query->join('story_pages', 'story_pages.story_id', '=', 'stories.id')
                        ->whereNotNull('story_pages.image_url')
                        ->where('story_pages.image_url', '!=', '');
                },
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (User $user) => $this->formatUser($user))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->load([
            'childProfiles' => function ($query) {
                $query->orderBy('name');
            },
            'stories' => function ($query) {
                $query->latest()->limit(6);
            },
        ]);

        $user->loadCount(['stories', 'childProfiles']);
        $user->loadCount([
            'stories as images_count' => function ($query) {
                $query->join('story_pages', 'story_pages.story_id', '=', 'stories.id')
                    ->whereNotNull('story_pages.image_url')
                    ->where('story_pages.image_url', '!=', '');
            },
        ]);

        $payload = $this->formatUser($user);
        $payload['children'] = $user->childProfiles->map(fn ($child) => [
            'id' => $child->id,
            'name' => $child->name,
            'age' => $child->age,
            'avatar' => $child->avatar,
        ])->values();
        $payload['recentStories'] = $user->stories->map(fn ($story) => [
            'id' => $story->id,
            'title' => $story->title,
            'genre' => $story->genre,
            'status' => $story->status ?: 'Pending',
            'createdAt' => optional($story->created_at)?->toDateTimeString(),
        ])->values();

        return response()->json([
            'success' => true,
            'data' => $payload,
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
            ],
        ]);
    }

    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:Active,Banned'],
        ]);

        $user->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->formatUser($user),
        ]);
    }

    private function formatUser(User $user): array
    {
        $name = $user->full_name ?: $user->email;
        $plan = $user->plan ?: 'free';

        return [
            'id' => $user->id,
            'name' => $name,
            'email' => $user->email,
            'role' => 'Parent',
            'plan' => ucfirst($plan),
            'avatar' => $user->avatar,
            'stories' => (int) ($user->stories_count ?? 0),
            'images' => (int) ($user->images_count ?? 0),
            'children' => (int) ($user->child_profiles_count ?? 0),
            'totalSpent' => '$0',
            'joinedAt' => optional($user->created_at)?->format('M d, Y'),
            'status' => $user->status ?: 'Active',
            'lastActive' => optional($user->updated_at)?->diffForHumans() ?? 'Never',
        ];
    }
}
