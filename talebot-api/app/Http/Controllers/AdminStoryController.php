<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Models\StoryPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminStoryController extends Controller
{
    public function storiesIndex(): JsonResponse
    {
        $stories = Story::query()
            ->join('users', 'stories.user_id', '=', 'users.id')
            ->leftJoin('child_profiles', 'stories.child_id', '=', 'child_profiles.id')
            ->leftJoin('story_pages', 'story_pages.story_id', '=', 'stories.id')
            ->groupBy([
                'stories.id',
                'stories.title',
                'stories.genre',
                'stories.moral_lesson',
                'stories.story_length',
                'stories.illustration_style',
                'stories.cover_image',
                'stories.status',
                'stories.created_at',
                'users.email',
                'users.full_name',
                'child_profiles.name',
            ])
            ->orderByDesc('stories.created_at')
            ->selectRaw('
                stories.id,
                stories.title,
                stories.genre,
                stories.moral_lesson,
                stories.story_length,
                stories.illustration_style,
                stories.cover_image,
                stories.status,
                stories.created_at,
                users.email as user_email,
                users.full_name as user_name,
                child_profiles.name as child_name,
                COUNT(story_pages.id) as page_count,
                SUM(CASE WHEN story_pages.status = "Approved" THEN 1 ELSE 0 END) as approved_pages,
                SUM(CASE WHEN story_pages.status = "Pending" OR story_pages.status IS NULL THEN 1 ELSE 0 END) as pending_pages,
                SUM(CASE WHEN story_pages.status = "Rejected" THEN 1 ELSE 0 END) as rejected_pages
            ')
            ->get()
            ->map(function ($story) {
                return [
                    'id' => $story->id,
                    'title' => $story->title,
                    'genre' => $story->genre,
                    'moralLesson' => $story->moral_lesson,
                    'storyLength' => $story->story_length,
                    'style' => $story->illustration_style,
                    'coverImage' => $story->cover_image,
                    'createdAt' => optional($story->created_at)?->toDateTimeString(),
                    'author' => $story->user_name ?: $story->user_email,
                    'email' => $story->user_email,
                    'childName' => $story->child_name,
                    'pageCount' => (int) $story->page_count,
                    'approvedPages' => (int) $story->approved_pages,
                    'pendingPages' => (int) $story->pending_pages,
                    'rejectedPages' => (int) $story->rejected_pages,
                    'status' => $story->status ?: 'Pending',
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $stories,
        ]);
    }

    public function show(Story $story): JsonResponse
    {
        $story->load([
            'pages' => function ($query) {
                $query->orderBy('page_number');
            },
        ]);

        $approvedPages = $story->pages->where('status', 'Approved')->count();
        $pendingPages = $story->pages->filter(fn ($page) => ($page->status ?? 'Pending') === 'Pending')->count();
        $rejectedPages = $story->pages->where('status', 'Rejected')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $story->id,
                'title' => $story->title,
                'genre' => $story->genre,
                'moralLesson' => $story->moral_lesson,
                'storyLength' => $story->story_length,
                'style' => $story->illustration_style,
                'coverImage' => $story->cover_image,
                'status' => $story->status ?: 'Pending',
                'createdAt' => optional($story->created_at)?->toDateTimeString(),
                'pageCount' => $story->pages->count(),
                'approvedPages' => $approvedPages,
                'pendingPages' => $pendingPages,
                'rejectedPages' => $rejectedPages,
                'pages' => $story->pages->map(function ($page) {
                    return [
                        'id' => $page->id,
                        'pageNumber' => $page->page_number,
                        'text' => $page->text_content,
                        'imageUrl' => $page->image_url,
                        'status' => $page->status ?: 'Pending',
                        'moderation' => $page->moderation_status ?: 'Review',
                    ];
                })->values(),
            ],
        ]);
    }

    public function updateStoryStatus(Request $request, Story $story): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:Pending,Approved,Rejected'],
        ]);

        $status = $validated['status'];
        $story->update([
            'status' => $status,
        ]);

        $story->load([
            'pages' => function ($query) {
                $query->orderBy('page_number');
            },
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $story->id,
                'status' => $status,
                'approvedPages' => $story->pages->where('status', 'Approved')->count(),
                'pendingPages' => $story->pages->filter(fn ($page) => ($page->status ?? 'Pending') === 'Pending')->count(),
                'rejectedPages' => $story->pages->where('status', 'Rejected')->count(),
            ],
        ]);
    }

    public function imagesIndex(): JsonResponse
    {
        $images = StoryPage::query()
            ->join('stories', 'story_pages.story_id', '=', 'stories.id')
            ->join('users', 'stories.user_id', '=', 'users.id')
            ->leftJoin('child_profiles', 'stories.child_id', '=', 'child_profiles.id')
            ->whereNotNull('story_pages.image_url')
            ->where('story_pages.image_url', '!=', '')
            ->orderByDesc('story_pages.created_at')
            ->select([
                'story_pages.id',
                'story_pages.page_number',
                'story_pages.image_url',
                'story_pages.text_content',
                'story_pages.status',
                'story_pages.moderation_status',
                'story_pages.created_at',
                'stories.id as story_id',
                'stories.title as story_title',
                'stories.genre',
                'stories.illustration_style',
                'users.email as user_email',
                'users.full_name as user_name',
                'child_profiles.name as child_name',
            ])
            ->get()
            ->map(function ($page) {
                return [
                    'id' => $page->id,
                    'storyId' => $page->story_id,
                    'story' => $page->story_title,
                    'user' => $page->user_name ?: $page->user_email,
                    'email' => $page->user_email,
                    'childName' => $page->child_name,
                    'genre' => $page->genre,
                    'style' => $page->illustration_style,
                    'pageNumber' => $page->page_number,
                    'imageUrl' => $page->image_url,
                    'prompt' => Str::limit(trim((string) $page->text_content), 140),
                    'size' => 'Generated',
                    'credits' => 1,
                    'createdAt' => optional($page->created_at)?->toDateTimeString(),
                    'moderation' => $page->moderation_status ?: 'Review',
                    'status' => $page->status ?: 'Pending',
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $images,
        ]);
    }

    public function updateImageStatus(Request $request, StoryPage $storyPage): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:Pending,Approved,Rejected'],
        ]);

        $status = $validated['status'];
        $moderationStatus = match ($status) {
            'Approved' => 'Safe',
            'Rejected' => 'Flagged',
            default => 'Review',
        };

        $storyPage->update([
            'status' => $status,
            'moderation_status' => $moderationStatus,
            'image_url' => $status === 'Rejected' ? null : $storyPage->image_url,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $storyPage->id,
                'status' => $storyPage->status,
                'moderation' => $storyPage->moderation_status,
            ],
        ]);
    }
}
