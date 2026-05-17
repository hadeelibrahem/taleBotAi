<?php

namespace App\Http\Controllers;

use App\Models\Story;
use Illuminate\Http\Request;

class StoryViewController extends Controller
{
 public function index(Request $request)
{
    $request->validate([
        'child_id' => ['required', 'integer', 'exists:child_profiles,id'],
    ]);

    $stories = Story::where('child_id', $request->child_id)
        ->where('status', 'Approved')
        ->with('pages:id,story_id,image_url,status')
        ->withCount('pages')
        ->latest()
        ->get()
        ->map(function ($story) {
            $coverImage = $this->visibleCoverImage($story);

            return [
                'id' => $story->id,
                'title' => $story->title,
                'genre' => $story->genre,
                'moral_lesson' => $story->moral_lesson,
                'image' => $coverImage,
                'cover_image' => $coverImage,
                'pages_count' => $story->pages_count,
                'created_at' => $story->created_at,
            ];
        })
        ->values();

    return response()->json([
        'success' => true,
        'data' => $stories
    ]);
}

public function childStories($id)
{
    $stories = Story::where('child_id', $id)
        ->where('status', 'Approved')
        ->with('pages:id,story_id,image_url,status')
        ->withCount('pages')
        ->latest()
        ->get()
        ->map(function ($story) {
            $coverImage = $this->visibleCoverImage($story);

            return [
                'id' => $story->id,
                'title' => $story->title,
                'genre' => $story->genre,
                'moral_lesson' => $story->moral_lesson,
                'image' => $coverImage,
                'cover_image' => $coverImage,
                'pages_count' => $story->pages_count,
                'created_at' => $story->created_at,
            ];
        })
        ->values();

    return response()->json([
        'success' => true,
        'data' => $stories
    ]);
}

    public function show($id)
{
    $story = Story::with(['pages' => function ($q) {
        $q->orderBy('page_number');
    }])
        ->where('status', 'Approved')
        ->findOrFail($id);

    $coverImage = $this->visibleCoverImage($story);

    return response()->json([
        'success' => true,
        'data' => [
            'id' => $story->id,
            'title' => $story->title,
            'image' => $coverImage,

            'chapters' => $story->pages->map(function ($page) {
                return [
                    'id' => $page->id,
                    'title' => 'Page ' . $page->page_number, 
                    'content' => $page->text_content,       
                    'image' => $this->visiblePageImage($page),
                ];
            }),
        ]
    ]);
}

public function showForChild($childId, $storyId)
{
    $story = Story::where('child_id', $childId)
        ->where('status', 'Approved')
        ->with(['pages' => function ($q) {
            $q->orderBy('page_number');
        }])
        ->findOrFail($storyId);

    $coverImage = $this->visibleCoverImage($story);

    return response()->json([
        'success' => true,
        'data' => [
            'id' => $story->id,
            'title' => $story->title,
            'image' => $coverImage,

            'chapters' => $story->pages->map(function ($page) {
                return [
                    'id' => $page->id,
                    'title' => 'Page ' . $page->page_number,
                    'content' => $page->text_content,
                    'image' => $this->visiblePageImage($page),
                ];
            }),
        ]
    ]);
}

private function visiblePageImage($page): ?string
{
    return $page->status === 'Rejected' ? null : $page->image_url;
}

private function visibleCoverImage(Story $story): ?string
{
    $coverPage = $story->pages->firstWhere('image_url', $story->cover_image)
        ?? $story->pages->sortBy('page_number')->first();

    if ($coverPage && $coverPage->status === 'Rejected') {
        return null;
    }

    return $story->cover_image;
}
}
