<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class AdminLogController extends Controller
{
    private const LOG_PATH = 'logs/laravel.log';

    public function index(): JsonResponse
    {
        $path = storage_path(self::LOG_PATH);

        if (! File::exists($path)) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        $content = File::get($path);
        $entries = collect(preg_split('/\R(?=\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\])/', trim($content)) ?: [])
            ->filter()
            ->map(fn (string $entry, int $index) => $this->formatEntry($entry, $index))
            ->filter()
            ->reverse()
            ->take(100)
            ->values();

        return response()->json([
            'success' => true,
            'data' => $entries,
        ]);
    }

    public function destroy(): JsonResponse
    {
        File::put(storage_path(self::LOG_PATH), '');

        return response()->json([
            'success' => true,
            'data' => [],
        ]);
    }

    private function formatEntry(string $entry, int $index): ?array
    {
        if (! preg_match('/^\[(?<time>[^\]]+)\]\s+(?<environment>[^.]+)\.(?<level>[A-Z]+):\s+(?<body>.*)$/s', $entry, $matches)) {
            return null;
        }

        $body = trim($matches['body']);
        $contextPosition = strpos($body, ' {"');
        $message = $contextPosition === false ? $body : trim(substr($body, 0, $contextPosition));

        return [
            'id' => md5($matches['time'].$matches['level'].$index.$message),
            'type' => ucfirst(strtolower($matches['level'])),
            'level' => strtolower($matches['level']),
            'source' => $this->sourceFromBody($body),
            'detail' => Str::limit($message, 220),
            'message' => $message,
            'time' => $matches['time'],
            'environment' => $matches['environment'],
            'context' => $contextPosition === false ? '' : trim(substr($body, $contextPosition)),
            'raw' => Str::limit($entry, 2000),
        ];
    }

    private function sourceFromBody(string $body): string
    {
        if (preg_match('/\((?<class>[A-Za-z0-9_\\\\]+)\(code:/', $body, $matches)) {
            return class_basename($matches['class']);
        }

        if (Str::contains($body, ['Gemini', 'GEMINI'])) {
            return 'Gemini API';
        }

        if (Str::contains($body, ['Leonardo', 'LEONARDO'])) {
            return 'Leonardo API';
        }

        if (Str::contains($body, ['SQLSTATE', 'database', 'Database'])) {
            return 'Database';
        }

        if (Str::contains($body, ['Tinker', 'PsySH', 'psysh'])) {
            return 'Laravel Tinker';
        }

        return 'Laravel';
    }
}
