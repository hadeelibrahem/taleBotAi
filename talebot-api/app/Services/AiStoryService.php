<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AiStoryService
{

private function uploadChildPhotoToLeonardo(array $data, string $apiKey): ?string
{
    if (empty($data['child_photo_path'])) {
        return null;
    }

    $absolutePath = storage_path('app/private/' . $data['child_photo_path']);

    if (!file_exists($absolutePath)) {
        logger()->warning('Child photo file not found', ['path' => $absolutePath]);
        return null;
    }

    $extension = strtolower(pathinfo($absolutePath, PATHINFO_EXTENSION));
    if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp'])) {
        logger()->warning('Unsupported child photo extension', ['extension' => $extension]);
        return null;
    }

    // 1) اطلب presigned URL + image id
    $initResponse = Http::timeout(60)
        ->withHeaders([
            'accept' => 'application/json',
            'authorization' => 'Bearer ' . $apiKey,
            'content-type' => 'application/json',
        ])
        ->post('https://cloud.leonardo.ai/api/rest/v1/init-image', [
            'extension' => $extension,
        ]);

    logger()->info('Leonardo init-image response', [
        'status' => $initResponse->status(),
        'body' => $initResponse->json(),
    ]);

    if (!$initResponse->successful()) {
        return null;
    }

    $uploadUrl = data_get($initResponse->json(), 'uploadInitImage.url')
        ?? data_get($initResponse->json(), 'uploadInitImage.fields.url')
        ?? data_get($initResponse->json(), 'url');

    $fields = data_get($initResponse->json(), 'uploadInitImage.fields', []);
    $imageId = data_get($initResponse->json(), 'uploadInitImage.id')
        ?? data_get($initResponse->json(), 'id');

    if (is_string($fields)) {
        $decodedFields = json_decode($fields, true);
        $fields = is_array($decodedFields) ? $decodedFields : [];
    }

    if (!is_array($fields)) {
        logger()->warning('Leonardo init-image fields are not iterable', [
            'fields_type' => gettype($fields),
            'body' => $initResponse->json(),
        ]);
        $fields = [];
    }

    if (!$uploadUrl || !$imageId) {
        logger()->warning('Leonardo init-image missing upload URL or image ID', [
            'body' => $initResponse->json(),
        ]);
        return null;
    }

    // 2) ارفع الملف إلى S3 presigned URL
    $multipart = [];
    foreach ($fields as $key => $value) {
        if ($key === 'url') {
            continue;
        }
        $multipart[] = [
            'name' => $key,
            'contents' => (string) $value,
        ];
    }

    $multipart[] = [
        'name' => 'file',
        'contents' => fopen($absolutePath, 'r'),
        'filename' => basename($absolutePath),
    ];

    $uploadResponse = Http::timeout(120)
        ->asMultipart()
        ->post($uploadUrl, $multipart);

    logger()->info('Leonardo S3 upload response', [
        'status' => $uploadResponse->status(),
        'body' => $uploadResponse->body(),
    ]);

    if (!$uploadResponse->successful()) {
        return null;
    }

    return $imageId;
}

private function getLeonardoChildImageId(array $data, string $apiKey): ?string
{
    if (empty($data['use_child_photo']) || empty($data['child_photo_path'])) {
        return null;
    }

    return $this->uploadChildPhotoToLeonardo($data, $apiKey);
}

    public function generate(array $data): array
{
    set_time_limit(180);

    $story = $this->generateStructuredStory($data);

    if (!empty($data['skip_image_generation'])) {
        $story['pages'] = collect($story['pages'] ?? [])
            ->map(function ($page) {
                $page['image'] = null;
                $page['image_mime_type'] = null;
                $page['image_debug'] = [
                    'skipped' => true,
                    'reason' => 'plan_image_limit_reached',
                ];

                return $page;
            })
            ->values()
            ->all();

        return $story;
    }

    return $this->generateImagesForPages($story, $data);
}

/*public function generate($data)
{
    return [
        "title" => "Test Story",
        "pages" => [
            [
                "page_number" => 1,
                "text" => "Once upon a time...",
                "image" => "https://via.placeholder.com/300"
            ],
            [
                "page_number" => 2,
                "text" => "The end.",
                "image" => "https://via.placeholder.com/300"
            ]
        ]
    ];
}*/
    private function generateStructuredStory(array $data): array
    {
        $apiKey = env('GROQ_API_KEY');

        if (!$apiKey) {
            return $this->generateLocalStory($data, [
                'source' => 'local',
                'reason' => 'GROQ_API_KEY is missing',
            ]);
        }

        $prompt = $this->buildStructuredStoryPrompt($data);

        $response = Http::timeout(60)
            ->withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])
            ->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => env('GROQ_MODEL', 'llama-3.1-8b-instant'),
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You write structured children stories in valid JSON only and follow the requested story language exactly.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'temperature' => 0.8,
                'max_tokens' => 2200,
                'response_format' => [
                    'type' => 'json_object',
                ],
            ]);

        if (!$response->successful()) {
            return $this->generateLocalStory($data, [
                'source' => 'local',
                'groq_error' => [
                    'status' => $response->status(),
                    'body' => $response->json(),
                    'raw' => $response->body(),
                ],
            ]);
        }

        $text = data_get($response->json(), 'choices.0.message.content', '{}');
        $decoded = json_decode($text, true);

        if (!is_array($decoded)) {
            return $this->generateLocalStory($data, [
                'source' => 'local',
                'reason' => 'Invalid JSON from story model',
                'raw_text' => $text,
            ]);
        }

        return [
            'title' => $decoded['title'] ?? "The Magical Adventure of {$data['child_name']}",
            'opening_sentence' => $decoded['opening_sentence'] ?? "Once upon a time, {$data['child_name']} began a magical journey.",
            'character_bible' => $decoded['character_bible'] ?? $this->buildFallbackCharacterBible($data),
            'visual_theme' => $decoded['visual_theme'] ?? $this->buildFallbackVisualTheme($data),
            'pages' => collect($decoded['pages'] ?? [])
                ->map(function ($page, $index) {
                    return [
                        'page_number' => $page['page_number'] ?? ($index + 1),
                        'text' => $page['text']
                            ?? $page['content']
                            ?? $page['story_text']
                            ?? $page['page_text']
                            ?? '',
                        'scene_prompt' => $page['scene_prompt'] ?? '',
                    ];
                })
                ->values()
                ->all(),
            'source' => 'groq',
        ];
    }

private function buildStructuredStoryPrompt(array $data): string
{
    $pagesCount = match ($data['story_length']) {
        'short' => 3,
        'medium' => 5,
        'long' => 7,
        default => 4,
    };

    $pageLengthRule = match ($data['story_length']) {
        'short' => 'Each page must contain exactly 2 short sentences.',
        'medium' => 'Each page must contain 4 to 6 sentences with enough detail.',
        'long' => 'Each page must contain 6 to 8 sentences with richer detail and smoother transitions.',
        default => 'Each page must contain 3 to 4 sentences.',
    };

    $styleRules = $this->getStyleRulesForStoryPrompt($data['illustration_style']);
    $language = $data['language'] ?? 'en';
    $languageLabel = $language === 'ar' ? 'Arabic' : 'English';
    $languageRules = $language === 'ar'
        ? '- Write title, opening_sentence, all page text, character_bible, and visual_theme values in natural Modern Standard Arabic suitable for children.
- Use Arabic script only for story prose. Do not mix English words into the story text unless the child name itself is English.
- Keep the Arabic warm, simple, and easy for children to understand.
- Keep every scene_prompt in English for image generation.'
        : '- Write title, opening_sentence, all page text, character_bible, visual_theme, and scene_prompt values in simple child-friendly English.';
    $childPhotoRule = !empty($data['use_child_photo'])
        ? 'A child photo will be used later as the visual identity reference. Do not invent specific facial traits that could conflict with the uploaded photo; keep appearance flexible and say the main character should match the uploaded child reference.'
        : 'Describe a clear, consistent child character appearance.';

    return <<<PROMPT
Create a children's story in valid JSON only.

Child details:
- Child name: {$data['child_name']}
- Age: {$data['age']}
- Moral lesson: {$data['moral_lesson']}
- Story length: {$data['story_length']}
- Story language: {$languageLabel}
- Genre: {$data['genre']}
- Illustration style: {$data['illustration_style']}

Return ONLY valid JSON with this exact structure:
{
  "title": "string",
  "opening_sentence": "string",
  "character_bible": {
    "main_character_name": "string",
    "appearance": "string",
    "clothes": "string",
    "personality": "string",
    "companions": ["string"],
    "non_negotiables": ["string"]
  },
  "visual_theme": {
    "style": "string",
    "palette": "string",
    "lighting": "string",
    "mood": "string",
    "environment_feel": "string"
  },
  "pages": [
    {
      "page_number": 1,
      "text": "string",
      "scene_prompt": "string"
    }
  ]
}

Story rules:
- Generate exactly {$pagesCount} pages.
- {$pageLengthRule}
- Use simple, child-friendly English.
- Make the story emotionally warm and natural.
- The moral lesson must appear naturally by the end.
- Keep the same characters across all pages.
- Each page should clearly continue from the previous page.
- Do not make the story too short for the requested length.
- {$languageRules}

Illustration rules:
- The scene_prompt of each page must describe ONLY that page image.
- The character appearance must stay consistent across all pages.
- {$childPhotoRule}
- The illustration style must be exactly "{$data['illustration_style']}".
- The visual theme must strongly match the requested illustration style.
- Every scene_prompt must explicitly reinforce the style.
- All pages must look like they belong to the same exact picture book.

Style enforcement rules:
{$styleRules}

Return valid JSON only. No markdown. No explanation.
PROMPT;
}

private function getStyleRulesForStoryPrompt(string $style): string
{
    $style = strtolower(trim($style));

    if (str_contains($style, 'pencil')) {
        return '- Every scene_prompt must explicitly include: black and white pencil sketch, graphite drawing, hand-drawn sketchbook lines, cross-hatching shading, monochrome, no paint, no watercolor, no color fill.';
    }

    if (str_contains($style, 'water')) {
        return '- Every scene_prompt must explicitly include: soft watercolor illustration, watercolor wash, painted paper texture, delicate brush strokes, gentle color blending, no graphite sketch look, no monochrome.';
    }

    if (str_contains($style, 'cartoon')) {
        return '- Every scene_prompt must explicitly include: clean cartoon outlines, playful stylized shapes, bold simple character design, bright flat colors, child-friendly cartoon illustration, no realistic rendering.';
    }

    if (str_contains($style, 'whimsical')) {
        return '- Every scene_prompt must explicitly include: whimsical children\'s book illustration, dreamy magical mood, imaginative fantasy details, playful soft forms, charming stylized world.';
    }

    return '- Keep one consistent children\'s storybook illustration style across all pages.';
}

   private function buildPollinationsPrompt(
    string $pageText,
    string $scenePrompt,
    array $characterBible,
    array $visualTheme,
    string $storyTitle
): string {
    $characterSummary = $this->characterBibleToText($characterBible);
    $themeSummary = $this->visualThemeToText($visualTheme);
    $style = strtolower($visualTheme['style'] ?? '');
    $styleEnforcement = $this->getPollinationsStyleEnforcement($style);

    return trim("
Children's storybook illustration.

Story title: {$storyTitle}

Character consistency:
{$characterSummary}

Visual theme:
{$themeSummary}

Page text:
{$pageText}

Scene:
{$scenePrompt}

Strict style enforcement:
{$styleEnforcement}

Rules:
- same main character
- same clothes
- same companions
- same illustration style across all pages
- same colors and mood
- no text in image
- child-friendly picture book look
");
}

private function getPollinationsStyleEnforcement(string $style): string
{
    if (str_contains($style, 'pencil')) {
        return 'black and white pencil sketch, graphite drawing, hand-drawn lines, cross-hatching shading, monochrome, no paint, no watercolor, no colored fill, no realistic render';
    }

    if (str_contains($style, 'water')) {
        return 'soft watercolor illustration, watercolor wash, painted paper texture, delicate brush strokes, gentle color blending, no graphite sketch look, no monochrome';
    }

    if (str_contains($style, 'cartoon')) {
        return 'clean cartoon outlines, playful stylized shapes, bright flat colors, child-friendly cartoon design, no photorealism, no watercolor texture';
    }

    if (str_contains($style, 'whimsical')) {
        return 'whimsical children\'s book illustration, dreamy magical mood, playful imaginative fantasy details, charming stylized world, soft enchanted atmosphere';
    }

    return 'consistent children\'s storybook illustration style';
}

    private function pollinationsFallback(
        string $pageText,
        string $scenePrompt,
        array $characterBible,
        array $visualTheme,
        string $storyTitle,
        array $debug = []
    ): array {
        $prompt = $this->buildPollinationsPrompt(
            $pageText,
            $scenePrompt,
            $characterBible,
            $visualTheme,
            $storyTitle
        );

        $url = 'https://image.pollinations.ai/prompt/' . urlencode($prompt);

        return [
            'data_uri' => $url,
            'base64' => null,
            'mime_type' => 'image/url',
            'debug' => array_merge([
                'provider' => 'pollinations',
                'fallback' => true,
            ], $debug),
        ];
    }

   private function generateImagesForPages(array $story, array $data): array
{
    $pages = $story['pages'] ?? [];
    $previousLeonardoUrl = null;

    $apiKey = env('LEONARDO_API_KEY');
    $childReferenceImageId = null;

    if ($apiKey && !empty($data['use_child_photo']) && !empty($data['child_photo_path'])) {
        $childReferenceImageId = $this->getLeonardoChildImageId($data, $apiKey);
    }

    foreach ($pages as $index => $page) {
        $imageResult = $this->generatePageImage(
            pageText: $page['text'] ?? '',
            scenePrompt: $page['scene_prompt'] ?? '',
            characterBible: $story['character_bible'] ?? [],
            visualTheme: $story['visual_theme'] ?? [],
            storyTitle: $story['title'] ?? 'Story',
            data: $data,
            childReferenceImageId: $childReferenceImageId,
            previousLeonardoUrl: $previousLeonardoUrl
        );

        $pages[$index]['image'] = $imageResult['data_uri'] ?? null;
        $pages[$index]['image_mime_type'] = $imageResult['mime_type'] ?? null;
        $pages[$index]['image_debug'] = $imageResult['debug'] ?? null;

        if (!empty($imageResult['leonardo_image_url'])) {
            $previousLeonardoUrl = $imageResult['leonardo_image_url'];
        }
    }

    $story['pages'] = $pages;

    return $story;
}
 private function generatePageImage(
    string $pageText,
    string $scenePrompt,
    array $characterBible,
    array $visualTheme,
    string $storyTitle,
    array $data,
    ?string $childReferenceImageId = null, 
    ?string $previousLeonardoUrl = null
): array {
    $apiKey = env('LEONARDO_API_KEY');

    if (!$apiKey) {
        return $this->pollinationsFallback(
            $pageText,
            $scenePrompt,
            $characterBible,
            $visualTheme,
            $storyTitle,
            ['message' => 'LEONARDO_API_KEY is missing']
        );
    }

    $prompt = $this->buildLeonardoPrompt(
        $pageText,
        $scenePrompt,
        $characterBible,
        $visualTheme,
        $storyTitle,
        !empty($childReferenceImageId),
        !empty($previousLeonardoUrl)
    );

   $payload = [
    'prompt' => $prompt,
    'modelId' => env('LEONARDO_MODEL_ID', 'b2614463-296c-462a-9586-aafdb8f00e36'),
    'width' => (int) env('LEONARDO_WIDTH', 1024),
    'height' => (int) env('LEONARDO_HEIGHT', 1024),
    'num_images' => 1,
    'num_inference_steps' => (int) env('LEONARDO_STEPS', 20),
    'guidance_scale' => (float) env('LEONARDO_GUIDANCE_SCALE', 7),
    'alchemy' => filter_var(env('LEONARDO_ALCHEMY', false), FILTER_VALIDATE_BOOL),
    'negative_prompt' => 'blurry, distorted face, extra fingers, cropped, text, caption, watermark, logo, duplicate character, inconsistent clothes, scary, realistic photo, photorealistic, 3d render, glossy render, random style changes, mixed art styles, inconsistent palette, inconsistent rendering',
];

    if ($childReferenceImageId) {
        if (filter_var(env('LEONARDO_USE_CHARACTER_REFERENCE_CONTROLNET', false), FILTER_VALIDATE_BOOL)) {
            $payload['controlnets'] = [
                [
                    'initImageId' => $childReferenceImageId,
                    'initImageType' => 'UPLOADED',
                    'preprocessorId' => (int) env('LEONARDO_CHARACTER_REFERENCE_PREPROCESSOR_ID', 133),
                    'strengthType' => env('LEONARDO_CHARACTER_REFERENCE_STRENGTH', 'High'),
                    'weight' => (float) env('LEONARDO_CHARACTER_REFERENCE_WEIGHT', 1.8),
                ],
            ];
        } else {
            $payload['imagePrompts'] = [$childReferenceImageId];
        }
    }

    $response = Http::timeout(120)
        ->withHeaders([
            'accept' => 'application/json',
            'authorization' => 'Bearer ' . $apiKey,
            'content-type' => 'application/json',
        ])
        ->post('https://cloud.leonardo.ai/api/rest/v1/generations', $payload);

    logger()->info('Leonardo generation response', [
        'status' => $response->status(),
        'body' => $response->json(),
    ]);

    if (
        !$response->successful() &&
        $childReferenceImageId &&
        isset($payload['controlnets']) &&
        str_contains(strtolower((string) data_get($response->json(), 'error', '')), 'does not support')
    ) {
        unset($payload['controlnets']);
        $payload['imagePrompts'] = [$childReferenceImageId];

        $response = Http::timeout(120)
            ->withHeaders([
                'accept' => 'application/json',
                'authorization' => 'Bearer ' . $apiKey,
                'content-type' => 'application/json',
            ])
            ->post('https://cloud.leonardo.ai/api/rest/v1/generations', $payload);

        logger()->info('Leonardo generation retry without controlnets response', [
            'status' => $response->status(),
            'body' => $response->json(),
        ]);
    }

    if (!$response->successful()) {
        return $this->pollinationsFallback(
            $pageText,
            $scenePrompt,
            $characterBible,
            $visualTheme,
            $storyTitle,
            [
                'provider' => 'leonardo',
                'error' => 'generation failed - fallback to pollinations',
                'status' => $response->status(),
                'body' => $response->json(),
            ]
        );
    }

    $generationId = data_get($response->json(), 'sdGenerationJob.generationId');

    if (!$generationId) {
        return $this->pollinationsFallback(
            $pageText,
            $scenePrompt,
            $characterBible,
            $visualTheme,
            $storyTitle,
            [
                'provider' => 'leonardo',
                'message' => 'No generationId returned',
                'leonardo_response' => $response->json(),
            ]
        );
    }

    $pollResult = $this->pollLeonardoGeneration($generationId, $apiKey);

    if (!$pollResult['ok']) {
        return $this->pollinationsFallback(
            $pageText,
            $scenePrompt,
            $characterBible,
            $visualTheme,
            $storyTitle,
            array_merge(['provider' => 'leonardo'], $pollResult['debug'])
        );
    }

   return [
    'data_uri' => $pollResult['image_url'],
    'leonardo_image_url' => $pollResult['image_url'],
    'base64' => null,
    'mime_type' => 'image/url',
    'debug' => [
        'provider' => 'leonardo',
        'generation_id' => $generationId,
        'used_previous_reference' => !empty($previousLeonardoUrl),
        'child_reference_used' => !empty($childReferenceImageId),
        'child_reference_mode' => isset($payload['controlnets']) ? 'controlnets' : (!empty($payload['imagePrompts']) ? 'imagePrompts' : null),
    ],
];
}
   private function pollLeonardoGeneration(string $generationId, string $apiKey): array
{
    $maxAttempts = 12;
    $delayMs = 3000;

    for ($i = 0; $i < $maxAttempts; $i++) {
        $response = \Illuminate\Support\Facades\Http::withToken($apiKey)
            ->acceptJson()
            ->get("https://cloud.leonardo.ai/api/rest/v1/generations/{$generationId}");

        if (!$response->successful()) {
            usleep($delayMs * 1000);
            continue;
        }

        $json = $response->json();

        $generation = $json['generations_by_pk'] ?? null;

        if (!$generation) {
            usleep($delayMs * 1000);
            continue;
        }

        $status = $generation['status'] ?? null;

        if ($status === 'COMPLETE') {
            $images = $generation['generated_images'] ?? [];

            if (!empty($images) && !empty($images[0]['url'])) {
                return [
                    'ok' => true,
                    'image_url' => $images[0]['url'],
                    'debug' => [
                        'status' => $status,
                        'generation' => $generation,
                    ],
                ];
            }

            return [
                'ok' => false,
                'debug' => [
                    'status' => $status,
                    'message' => 'Generation completed but no image URL was returned.',
                    'generation' => $generation,
                ],
            ];
        }

        if ($status === 'FAILED') {
            return [
                'ok' => false,
                'debug' => [
                    'status' => $status,
                    'message' => 'Leonardo generation failed.',
                    'generation' => $generation,
                ],
            ];
        }

        usleep($delayMs * 1000);
    }

    return [
        'ok' => false,
        'debug' => [
            'status' => 'TIMEOUT',
            'message' => 'Leonardo generation polling timed out.',
        ],
    ];
}
  private function buildLeonardoPrompt(
    string $pageText,
    string $scenePrompt,
    array $characterBible,
    array $visualTheme,
    string $storyTitle,
    bool $useChildPhotoReference = false,
    bool $usePreviousPageContinuity = false
): string {
    $mainCharacter = $characterBible['main_character_name'] ?? 'Child';
    $appearance = $characterBible['appearance'] ?? '';
    $clothes = $characterBible['clothes'] ?? '';
    $companions = implode(', ', $characterBible['companions'] ?? []);
    $style = strtolower($visualTheme['style'] ?? '');
    $mood = $visualTheme['mood'] ?? '';
    $palette = $visualTheme['palette'] ?? '';

    $styleEnforcement = $this->getShortLeonardoStyleEnforcement($style);

    $referenceRules = [];

    if ($useChildPhotoReference) {
        $referenceRules[] = 'Use the uploaded child photo as the character reference. Preserve the child\'s core identity cues: face shape, hairstyle, hair color, skin tone, eye shape, eyebrow shape, smile, and overall age impression. Translate those features into the requested illustration style; do not replace the child with a generic cartoon face.';
    }

    if ($usePreviousPageContinuity) {
        $referenceRules[] = 'Keep continuity with the previous page illustration while preserving the same character design and outfit.';
    }

    $referenceText = empty($referenceRules)
        ? ''
        : "\nReference rules: " . implode(' ', $referenceRules);

    return trim("
Children's storybook illustration.
Title: {$storyTitle}

Character: {$mainCharacter}, {$appearance}, wearing {$clothes}.
Companions: {$companions}.

Style: {$style}.
Mood: {$mood}.
Palette: {$palette}.

Scene: {$scenePrompt}

Style rules: {$styleEnforcement}
{$referenceText}

Keep the same character design, same outfit, same companions, same book style.
Prioritize recognizable illustrated likeness of the referenced child over generic cuteness.
Child-friendly.
No text, no logo, no watermark.
");
}

private function getShortLeonardoStyleEnforcement(string $style): string
{
    if (str_contains($style, 'pencil')) {
        return 'black and white pencil sketch, graphite lines, hand-drawn, cross-hatching, monochrome, no paint, no watercolor, no color';
    }

    if (str_contains($style, 'water')) {
        return 'soft watercolor illustration, watercolor wash, delicate brush strokes, painted texture, gentle color blending';
    }

    if (str_contains($style, 'cartoon')) {
        return 'clean cartoon outlines, playful stylized shapes, bright flat colors, child-friendly cartoon design';
    }

    if (str_contains($style, 'whimsical')) {
        return 'whimsical children book illustration, dreamy magical mood, playful fantasy details, charming stylized world';
    }

    return 'consistent children storybook illustration style';
}

private function getLeonardoStyleEnforcement(string $style): string
{
    if (str_contains($style, 'pencil')) {
        return "
STRICT STYLE: pencil sketch only.
Black and white only.
Graphite drawing only.
Hand-drawn sketchbook lines.
Visible pencil strokes.
Cross-hatching shading.
Soft graphite shadows.
No watercolor.
No paint.
No colored fill.
No realistic digital painting.
No glossy rendering.
No vibrant colors.
No photorealism.
No 3D look.
";
    }

    if (str_contains($style, 'water')) {
        return "
STRICT STYLE: watercolor only.
Soft watercolor paint texture.
Delicate brush strokes.
Painted paper feel.
Gentle color bleeding.
Transparent watercolor layers.
Soft blended pigments.
No pencil sketch style.
No monochrome graphite look.
No glossy digital rendering.
No hard cartoon flat fill.
";
    }

    if (str_contains($style, 'cartoon')) {
        return "
STRICT STYLE: cartoon only.
Clean cartoon outlines.
Flat or semi-flat colors.
Simple playful shapes.
Stylized child-friendly faces.
Bright cheerful design.
No realistic rendering.
No watercolor texture.
No graphite sketch texture.
No painterly realism.
";
    }

    if (str_contains($style, 'whimsical')) {
        return "
STRICT STYLE: whimsical only.
Dreamy whimsical children's book illustration.
Soft magical details.
Playful imaginative world.
Charming fantasy atmosphere.
Stylized storybook forms.
Gentle magical color harmony.
No photorealism.
No plain sketchbook study look.
";
    }

    return "
Use one strict, highly consistent children's storybook illustration style across all pages.
";
}

    private function characterBibleToText(array $characterBible): string
    {
        $companions = implode(', ', $characterBible['companions'] ?? []);
        $nonNegotiables = implode(', ', $characterBible['non_negotiables'] ?? []);

        return trim(
            "Main character name: " . ($characterBible['main_character_name'] ?? '') . "\n" .
            "Appearance: " . ($characterBible['appearance'] ?? '') . "\n" .
            "Clothes: " . ($characterBible['clothes'] ?? '') . "\n" .
            "Personality: " . ($characterBible['personality'] ?? '') . "\n" .
            "Companions: " . $companions . "\n" .
            "Never change: " . $nonNegotiables
        );
    }

    private function visualThemeToText(array $visualTheme): string
    {
        return trim(
            "Style: " . ($visualTheme['style'] ?? '') . "\n" .
            "Palette: " . ($visualTheme['palette'] ?? '') . "\n" .
            "Lighting: " . ($visualTheme['lighting'] ?? '') . "\n" .
            "Mood: " . ($visualTheme['mood'] ?? '') . "\n" .
            "Environment feel: " . ($visualTheme['environment_feel'] ?? '')
        );
    }

    private function buildFallbackCharacterBible(array $data): array
    {
        if (($data['language'] ?? 'en') === 'ar') {
            return [
                'main_character_name' => $data['child_name'],
                'appearance' => 'طفل لطيف الملامح بعينين معبرتين وابتسامة ودودة',
                'clothes' => 'ملابس مغامرة مميزة تبقى نفسها في كل الصفحات',
                'personality' => 'لطيف، فضولي، وشجاع',
                'companions' => ['صديق سحري صغير'],
                'non_negotiables' => [
                    'نفس تصميم الوجه',
                    'نفس الشعر',
                    'نفس الملابس',
                    'نفس الرفاق',
                ],
            ];
        }

        return [
            'main_character_name' => $data['child_name'],
            'appearance' => 'A cute child hero with expressive eyes and a friendly face',
            'clothes' => 'A signature adventure outfit that stays the same across all pages',
            'personality' => 'kind, curious, brave',
            'companions' => ['a small magical friend'],
            'non_negotiables' => [
                'same face design',
                'same hair',
                'same clothes',
                'same companions',
            ],
        ];
    }

    private function buildFallbackVisualTheme(array $data): array
    {
        if (($data['language'] ?? 'en') === 'ar') {
            return [
                'style' => $data['illustration_style'] . ' بأسلوب كتاب أطفال مصور',
                'palette' => 'ألوان ناعمة ومتناغمة',
                'lighting' => 'إضاءة سحرية لطيفة',
                'mood' => 'دافئ، خيالي، ومطمئن',
                'environment_feel' => 'عالم قصة من نوع ' . $data['genre'],
            ];
        }

        return [
            'style' => $data['illustration_style'] . " children's storybook illustration",
            'palette' => 'soft cohesive colors',
            'lighting' => 'gentle magical lighting',
            'mood' => 'warm, whimsical, comforting',
            'environment_feel' => $data['genre'] . ' story world',
        ];
    }

    private function generateLocalStory(array $data, array $debug = []): array
    {
        $name = $data['child_name'] ?: 'Little Star';
        $moral = $data['moral_lesson'] ?: 'Kindness';
        $genre = $data['genre'] ?: 'Fantasy';

        if (($data['language'] ?? 'en') === 'ar') {
            $arabicName = $data['child_name'] ?: 'النجم الصغير';
            $arabicMoral = $data['moral_lesson'] ?: 'اللطف';

            return [
                'title' => "مغامرة {$arabicName} السحرية",
                'opening_sentence' => "في صباح جميل، اكتشف {$arabicName} طريقا صغيرا يلمع كأنه يدعوه إلى مغامرة.",
                'character_bible' => $this->buildFallbackCharacterBible($data),
                'visual_theme' => $this->buildFallbackVisualTheme($data),
                'pages' => [
                    [
                        'page_number' => 1,
                        'text' => "كان {$arabicName} يحب طرح الأسئلة واستكشاف كل مكان جديد بقلب مليء بالفضول.",
                        'scene_prompt' => "{$arabicName} standing at the edge of a magical path, looking curious and excited.",
                    ],
                    [
                        'page_number' => 2,
                        'text' => "وفي ذلك اليوم، وجد علامة صغيرة مضيئة تقوده خطوة بعد خطوة نحو سر لطيف.",
                        'scene_prompt' => "{$arabicName} discovering a glowing clue in a magical forest.",
                    ],
                    [
                        'page_number' => 3,
                        'text' => "عندما ظهر تحد صغير، تنفس {$arabicName} بهدوء وفكر جيدا ثم تابع طريقه بشجاعة.",
                        'scene_prompt' => "{$arabicName} facing a gentle magical challenge with courage and calm.",
                    ],
                    [
                        'page_number' => 4,
                        'text' => "وفي نهاية الرحلة، تعلم {$arabicName} أن {$arabicMoral} يجعل العالم أدفأ وأجمل.",
                        'scene_prompt' => "{$arabicName} smiling at the end of the adventure in a warm magical setting.",
                    ],
                ],
                'raw_text' => 'local fallback story',
                'source' => 'local',
                'debug' => $debug,
            ];
        }

        return [
            'title' => "The {$genre} Adventure of {$name}",
            'opening_sentence' => "Once upon a time, {$name} discovered a magical path filled with wonder.",
            'character_bible' => $this->buildFallbackCharacterBible($data),
            'visual_theme' => $this->buildFallbackVisualTheme($data),
            'pages' => [
                [
                    'page_number' => 1,
                    'text' => "{$name} loved asking questions and exploring every sparkling corner of the world.",
                    'scene_prompt' => "{$name} standing at the edge of a magical path, looking curious and excited.",
                ],
                [
                    'page_number' => 2,
                    'text' => "One bright day, {$name} found a mysterious clue that led to an exciting adventure.",
                    'scene_prompt' => "{$name} discovering a glowing clue in a magical forest.",
                ],
                [
                    'page_number' => 3,
                    'text' => "When a challenge appeared, {$name} stayed calm, thought carefully, and kept going.",
                    'scene_prompt' => "{$name} facing a gentle magical challenge with courage and calm.",
                ],
                [
                    'page_number' => 4,
                    'text' => "By the end of the journey, {$name} learned that {$moral} can make every story brighter.",
                    'scene_prompt' => "{$name} smiling at the end of the adventure in a warm magical setting.",
                ],
            ],
            'raw_text' => 'local fallback story',
            'source' => 'local',
            'debug' => $debug,
        ];
    }
}
