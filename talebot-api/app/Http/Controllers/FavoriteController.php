<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Favorite;

class FavoriteController extends Controller
{
    public function store(Request $request)
{
    $favorite = Favorite::firstOrCreate([
        'child_id' => $request->child_id,
        'story_id' => $request->story_id,
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Added to favorites ❤️',
        'data' => $favorite
    ]);
}

public function destroy($child_id, $story_id)
{
    Favorite::where('child_id', $child_id)
        ->where('story_id', $story_id)
        ->delete();

    return response()->json([
        'success' => true,
        'message' => 'Removed from favorites ❌'
    ]);
}

public function check($child_id, $story_id)
{
    $exists = Favorite::where('child_id', $child_id)
        ->where('story_id', $story_id)
        ->exists();

    return response()->json([
        'success' => true,
        'is_favorite' => $exists
    ]);
}
}