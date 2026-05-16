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
        ->withCount('pages')
        ->latest()
        ->get()
        ->map(function ($story) {
            return [
                'id' => $story->id,
                'title' => $story->title,
                'genre' => $story->genre,
                'moral_lesson' => $story->moral_lesson,
                'image' => $story->cover_image,
                'cover_image' => $story->cover_image,
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
        ->withCount('pages')
        ->latest()
        ->get()
        ->map(function ($story) {
            return [
                'id' => $story->id,
                'title' => $story->title,
                'genre' => $story->genre,
                'moral_lesson' => $story->moral_lesson,
                'image' => $story->cover_image,
                'cover_image' => $story->cover_image,
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
    }])->findOrFail($id);

    return response()->json([
        'success' => true,
        'data' => [
            'id' => $story->id,
            'title' => $story->title,
            'image' => $story->cover_image,

            'chapters' => $story->pages->map(function ($page) {
                return [
                    'id' => $page->id,
                    'title' => 'Page ' . $page->page_number, 
                    'content' => $page->text_content,       
                    'image' => $page->image_url,             
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

    return response()->json([
        'success' => true,
        'data' => [
            'id' => $story->id,
            'title' => $story->title,
            'image' => $story->cover_image,

            'chapters' => $story->pages->map(function ($page) {
                return [
                    'id' => $page->id,
                    'title' => 'Page ' . $page->page_number,
                    'content' => $page->text_content,
                    'image' => $page->image_url,
                ];
            }),
        ]
    ]);
}
}
