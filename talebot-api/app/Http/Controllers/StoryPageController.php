<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StoryPage;

class StoryPageController extends Controller
{
    public function update(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $page = StoryPage::findOrFail($id);

        $page->text_content = $request->content;
        $page->save();

        return response()->json([
            'success' => true,
            'message' => 'Story text updated successfully',
            'data' => $page,
        ]);
    }
}