<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class CartoonVoiceController extends Controller
{
    public function generate(Request $request)
    {
        try {

            $request->validate([
                'text'=>'required|string'
            ]);

            if (! $this->canUseCartoonVoice($request->user())) {
                return response()->json([
                    'error' => 'Cartoon voice is available for Premium or Unlimited plans only.',
                ], 403);
            }

            $apiKey = env('TYPECAST_API_KEY');
            $voiceId = env('TYPECAST_VOICE_ID');

            if (empty($apiKey) || empty($voiceId)) {
                return response()->json([
                    'error' => 'Typecast is not configured. Please set TYPECAST_API_KEY and TYPECAST_VOICE_ID in .env.',
                ], 500);
            }

            $response = Http::withoutVerifying()
                ->withHeaders([
                    'X-API-KEY'=>$apiKey,
                    'Content-Type'=>'application/json'
                ])
                ->post(
                    'https://api.typecast.ai/v1/text-to-speech',
                    [
                        'voice_id'=>$voiceId,
                        'text'=>$request->text,
                        'model'=>'ssfm-v30'
                    ]
                );

            if(!$response->successful()){

                return response()->json([
                    'error'=>'Typecast failed',
                    'status'=>$response->status(),
                    'details'=>$response->json()
                ],502);

            }

            $contentType = $response->header('Content-Type', '');
            $body = $response->body();

            if (str_contains($contentType, 'application/json')) {
                $json = $response->json();
                $audioUrl = data_get($json, 'audio_url')
                    ?? data_get($json, 'url')
                    ?? data_get($json, 'result.audio_url')
                    ?? data_get($json, 'result.audio_download_url')
                    ?? data_get($json, 'result.speak_url');

                if ($audioUrl) {
                    return response()->json([
                        'audio_url' => $audioUrl,
                    ]);
                }

                return response()->json([
                    'error' => 'Typecast did not return an audio file or audio URL.',
                    'details' => $json,
                ], 502);
            }

            $extension = match (true) {
                str_contains($contentType, 'mpeg') || str_contains($contentType, 'mp3') => 'mp3',
                str_contains($contentType, 'ogg') => 'ogg',
                str_contains($contentType, 'webm') => 'webm',
                default => 'wav',
            };

            $filename='voice_'.time().'.'.$extension;

            Storage::disk('public')->put($filename, $body);

            return response()->json([
                'audio_url'=>asset('storage/'.$filename)
            ]);

        } catch(\Exception $e){

            return response()->json([
                'error'=>$e->getMessage()
            ],500);

        }
    }

    private function canUseCartoonVoice($user): bool
    {
        if (! $user) {
            return false;
        }

        $plan = strtolower((string) ($user->plan ?? 'free'));

        if (! in_array($plan, ['premium', 'unlimited'], true)) {
            return false;
        }

        if (($user->payment_status ?? 'active') === 'expired') {
            return false;
        }

        if ($user->plan_expires_at && $user->plan_expires_at->isPast()) {
            return false;
        }

        return true;
    }
}
