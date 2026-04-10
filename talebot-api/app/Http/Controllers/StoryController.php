<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerateStoryRequest;
use App\Services\AiStoryService;
use Illuminate\Http\JsonResponse;

class StoryController extends Controller
{
    public function generate(
        GenerateStoryRequest $request,
        AiStoryService $aiStoryService
    ): JsonResponse {
        $story = $aiStoryService->generate($request->validated());

        return response()->json([
            'success' => true,
            'data' => $story,
        ]);
    }
}