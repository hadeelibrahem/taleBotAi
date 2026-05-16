<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StoryProgress;

class StoryProgressController extends Controller
{
    public function store(Request $request)
    {
        $oldProgress = StoryProgress::where('child_id', $request->child_id)
            ->where('story_id', $request->story_id)
            ->first();

        $progress = StoryProgress::updateOrCreate(
            [
                'child_id' => $request->child_id,
                'story_id' => $request->story_id,
            ],
            [
                'progress_percentage' => max(
                    $oldProgress->progress_percentage ?? 0,
                    $request->progress_percentage
                ),
                'reading_time_minutes' => max(
                    $oldProgress->reading_time_minutes ?? 0,
                    $request->reading_time_minutes ?? 0
                ),
                'last_read_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Progress saved',
            'data' => $progress,
        ]);
    }

    public function show($child_id, $story_id)
    {
        $progress = StoryProgress::where('child_id', $child_id)
            ->where('story_id', $story_id)
            ->first();

        return response()->json([
            'success' => true,
            'data' => $progress,
        ]);
    }

    public function reset(Request $request)
    {
        StoryProgress::where('child_id', $request->child_id)
            ->where('story_id', $request->story_id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Progress reset',
        ]);
    }
}