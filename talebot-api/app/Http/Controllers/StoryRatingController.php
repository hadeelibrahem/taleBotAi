<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StoryRating;

class StoryRatingController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'child_id' => 'required|integer',
            'story_id' => 'required|integer',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $rating = StoryRating::updateOrCreate(
            [
                'child_id' => $request->child_id,
                'story_id' => $request->story_id,
            ],
            [
                'rating' => $request->rating,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Rating saved successfully ⭐',
            'data' => $rating
        ]);
    }
}