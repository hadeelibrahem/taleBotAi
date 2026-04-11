<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AiStoryService
{
    public function generate(array $data): array
    {
        $groqResult = $this->tryGroq($data);

        if ($groqResult['ok']) {
            return $groqResult['data'];
        }

        return $this->generateLocalStory($data, [
            'groq' => $groqResult['debug'],
            'source' => 'local',
        ]);
    }

    private function tryGroq(array $data): array
    {
        $apiKey = env('GROQ_API_KEY');

        if (!$apiKey) {
            return [
                'ok' => false,
                'data' => null,
                'debug' => [
                    'provider' => 'groq',
                    'status' => null,
                    'body' => ['message' => 'GROQ_API_KEY is missing'],
                    'raw' => null,
                ],
            ];
        }

        $prompt = $this->buildPrompt($data);

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
                        'content' => 'You write short, structured children stories and must follow the requested output format exactly.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'temperature' => 0.8,
                'max_tokens' => 500,
            ]);

        if ($response->successful()) {
            $text = data_get(
                $response->json(),
                'choices.0.message.content',
                ''
            );

            $parsed = $this->parseStoryText($text, $data);
            $parsed['source'] = 'groq';

            return [
                'ok' => true,
                'data' => $parsed,
                'debug' => null,
            ];
        }

        return [
            'ok' => false,
            'data' => null,
            'debug' => [
                'provider' => 'groq',
                'status' => $response->status(),
                'body' => $response->json(),
                'raw' => $response->body(),
            ],
        ];
    }

    private function buildPrompt(array $data): string
    {
        return "
Create a children's story based on these details:

Child Name: {$data['child_name']}
Age: {$data['age']}
Moral Lesson: {$data['moral_lesson']}
Story Length: {$data['story_length']}
Genre: {$data['genre']}
Illustration Style: {$data['illustration_style']}

Please return the result in this exact format:

TITLE: <story title>
OPENING: <one opening sentence>

PAGE 1: <text>
PAGE 2: <text>
PAGE 3: <text>
PAGE 4: <text>

Rules:
- Make it warm, magical, and age-appropriate.
- Make the moral lesson clear but natural.
- Keep each page short.
- Use simple English.
";
    }

    private function parseStoryText(string $text, array $data): array
    {
        $title = "The Magical Adventure of {$data['child_name']}";
        $opening = "Once upon a time, {$data['child_name']} began a magical journey.";
        $pages = [];

        if (preg_match('/TITLE:\s*(.+)/i', $text, $matches)) {
            $title = trim($matches[1]);
        }

        if (preg_match('/OPENING:\s*(.+)/i', $text, $matches)) {
            $opening = trim($matches[1]);
        }

        preg_match_all('/PAGE\s*(\d+):\s*(.+?)(?=PAGE\s*\d+:|$)/is', $text, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $pages[] = [
                'page_number' => (int) $match[1],
                'text' => trim($match[2]),
            ];
        }

        if (empty($pages)) {
            $pages = [
                [
                    'page_number' => 1,
                    'text' => $text ?: 'No story text returned.'
                ]
            ];
        }

        return [
            'title' => $title,
            'opening_sentence' => $opening,
            'pages' => $pages,
            'raw_text' => $text,
        ];
    }

    private function generateLocalStory(array $data, array $debug = []): array
    {
        $name = $data['child_name'] ?: 'Little Star';
        $moral = $data['moral_lesson'] ?: 'Kindness';
        $genre = $data['genre'] ?: 'Fantasy';

        return [
            'title' => "The {$genre} Adventure of {$name}",
            'opening_sentence' => "Once upon a time, {$name} discovered a magical path filled with wonder.",
            'pages' => [
                [
                    'page_number' => 1,
                    'text' => "{$name} loved asking questions and exploring every sparkling corner of the world."
                ],
                [
                    'page_number' => 2,
                    'text' => "One bright day, {$name} found a mysterious clue that led to an exciting adventure."
                ],
                [
                    'page_number' => 3,
                    'text' => "When a challenge appeared, {$name} stayed calm, thought carefully, and kept going."
                ],
                [
                    'page_number' => 4,
                    'text' => "By the end of the journey, {$name} learned that {$moral} can make every story brighter."
                ],
            ],
            'raw_text' => 'local fallback story',
            'source' => 'local',
            'debug' => $debug,
        ];
    }
}