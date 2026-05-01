<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerateStoryRequest;
use App\Models\Story;
use App\Models\StoryPage;
use App\Services\AiStoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StoryController extends Controller
{
    public function generate(
        GenerateStoryRequest $request,
        AiStoryService $aiStoryService
    ): JsonResponse {
        $data = $request->validated();

        if (
            $request->boolean('use_child_photo') &&
            $request->hasFile('child_photo')
        ) {
            $data['child_photo_path'] = $request->file('child_photo')->store('child-photos', 'public');
        }

        $generatedStory = $aiStoryService->generate($data);

        $story = DB::transaction(function () use ($data, $generatedStory) {
            $userId = auth()->id() ?? 1;

            $story = Story::create([
                'user_id' => $userId,
                'child_id' => $data['child_id'],
                'title' => $generatedStory['title'] ?? 'Untitled Story',
                'genre' => $data['genre'],
                'moral_lesson' => $data['moral_lesson'],
                'story_length' => $data['story_length'],
                'illustration_style' => $data['illustration_style'],
                'cover_image' => $generatedStory['pages'][0]['image'] ?? null,
                'status' => 'Pending',
            ]);

            foreach (($generatedStory['pages'] ?? []) as $page) {
                StoryPage::create([
                    'story_id' => $story->id,
                    'page_number' => $page['page_number'] ?? 1,
                    'text_content' => $page['text'] ?? '',
                    'image_url' => $page['image'] ?? null,
                    'status' => 'Pending',
                    'moderation_status' => 'Review',
                ]);
            }

            $story->load('pages');

            return $story;
        });

        return response()->json([
            'success' => true,
            'message' => 'Story generated successfully',
            'data' => [
                'id' => $story->id,
                'title' => $generatedStory['title'] ?? $story->title,
                'opening_sentence' => $generatedStory['opening_sentence'] ?? null,
                'character_bible' => $generatedStory['character_bible'] ?? null,
                'visual_theme' => $generatedStory['visual_theme'] ?? null,
                'pages' => collect($story->pages)->map(function ($page) {
                    return [
                        'page_number' => $page->page_number,
                        'text' => $page->text_content,
                        'image' => $page->image_url,
                    ];
                })->values(),
            ],
        ]);
    }
}
