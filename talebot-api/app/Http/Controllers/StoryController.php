<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerateStoryRequest;
use App\Models\ChildProfile;
use App\Models\Story;
use App\Models\StoryPage;
use App\Services\AiStoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class StoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Story::query()
            ->where('user_id', $request->user()->id);

        if ($request->filled('child_id')) {
            $query->where('child_id', $request->child_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('genre', 'like', "%{$search}%")
                    ->orWhere('moral_lesson', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->get(),
        ]);
    }

    public function generate(
        GenerateStoryRequest $request,
        AiStoryService $aiStoryService
    ): JsonResponse {
        $data = $request->validated();
        $user = $request->user();

        $planKey = $this->effectivePlanKey($user);
        $planLimits = $this->planLimits($planKey);
        $canUsePremiumCharacter = in_array($planKey, ['premium', 'unlimited'], true);
        $child = ChildProfile::where('user_id', $user->id)->findOrFail($data['child_id']);

        if ($request->boolean('use_child_photo') && ! $canUsePremiumCharacter) {
            return response()->json([
                'success' => false,
                'message' => 'Using a child photo as the story character is available for Premium or Unlimited users only.',
            ], 403);
        }

        if ($request->boolean('use_child_photo') && ! $child->allow_photo_usage) {
            return response()->json([
                'success' => false,
                'message' => 'Parent consent is required before using this child photo as a story character.',
            ], 403);
        }

        $limitResponse = $this->validatePlanLimits($user, $data, $planLimits);

        if ($limitResponse) {
            return $limitResponse;
        }

        $data['skip_image_generation'] = $this->shouldSkipImageGeneration($user, $data, $planLimits);

        if (! $data['skip_image_generation'] && $request->boolean('use_child_photo') && $request->hasFile('child_photo')) {
            $data['child_photo_path'] = $request->file('child_photo')->store('child-photos', 'local');
        }

        try {
            $generatedStory = $aiStoryService->generate($data);
        } finally {
            if (!empty($data['child_photo_path'])) {
                Storage::disk('local')->delete($data['child_photo_path']);
            }
        }

        $story = DB::transaction(function () use ($data, $generatedStory, $user) {
            $story = Story::create([
                'user_id' => $user->id,
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

            DB::table('activities')->insert([
                'user_id' => $user->id,
                'child_id' => $data['child_id'],
                'story_id' => $story->id,
                'activity_type' => 'story_created',
                'description' => 'Created a new story: ' . $story->title,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $story->load('pages');

            return $story;
        });

        return response()->json([
            'success' => true,
            'message' => 'Story generated successfully',
            'data' => [
                'id' => $story->id,
                'title' => $story->title,
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

    private function validatePlanLimits($user, array $data, array $planLimits): ?JsonResponse
    {
        $storyLimit = $planLimits['story_limit'];

        if ($storyLimit !== null && $user->stories()->count() >= $storyLimit) {
            return response()->json([
                'success' => false,
                'message' => "Your plan allows up to {$storyLimit} stories.",
            ], 403);
        }

        return null;
    }

    private function shouldSkipImageGeneration($user, array $data, array $planLimits): bool
    {
        $imageLimit = $planLimits['image_limit'];

        if ($imageLimit === null) {
            return false;
        }

        $existingImages = StoryPage::query()
            ->whereHas('story', fn ($query) => $query->where('user_id', $user->id))
            ->whereNotNull('image_url')
            ->count();

        $requestedImages = $this->pagesCountForLength($data['story_length'] ?? 'medium');

        return ($existingImages + $requestedImages) > $imageLimit;
    }

    private function pagesCountForLength(string $storyLength): int
    {
        return match ($storyLength) {
            'short' => 3,
            'medium' => 5,
            'long' => 7,
            default => 4,
        };
    }

    private function planLimits(string $planKey): array
    {
        $defaults = [
            'free' => ['story_limit' => 3, 'image_limit' => null],
            'premium' => ['story_limit' => null, 'image_limit' => 50],
            'unlimited' => ['story_limit' => null, 'image_limit' => null],
        ];

        $planKey = array_key_exists($planKey, $defaults) ? $planKey : 'premium';

        if (! Schema::hasTable('plan_settings')) {
            return $defaults[$planKey];
        }

        $settings = DB::table('plan_settings')->where('key', $planKey)->first();

        if (! $settings) {
            return $defaults[$planKey];
        }

        return [
            'story_limit' => $settings->story_limit === null ? null : (int) $settings->story_limit,
            'image_limit' => $settings->image_limit === null ? null : (int) $settings->image_limit,
        ];
    }

    private function effectivePlanKey($user): string
    {
        $planKey = strtolower((string) ($user?->plan ?? 'free'));

        if ($planKey === 'free') {
            return 'free';
        }

        if ($user?->plan_expires_at && $user->plan_expires_at->isPast()) {
            return 'free';
        }

        if (($user?->payment_status ?? 'active') === 'expired') {
            return 'free';
        }

        return $planKey;
    }
}
