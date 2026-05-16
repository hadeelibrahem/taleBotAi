<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreChildProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'age' => ['required', 'integer', 'min:1', 'max:18'],
            'avatar' => ['nullable', 'string', 'max:255'],
            'allow_photo_usage' => ['nullable', 'boolean'],
            'reading_time_limit' => ['nullable', 'integer', 'min:0', 'max:300'],
            'safe_content_filter' => ['nullable', 'boolean'],
            'disable_story_sharing' => ['nullable', 'boolean'],
            'moderate_language' => ['nullable', 'boolean'],
        ];
    }
}
