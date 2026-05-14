<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateChildProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:100'],
            'age' => ['sometimes', 'integer', 'min:1', 'max:18'],
            'avatar' => ['sometimes', 'nullable', 'string', 'max:255'],
            'reading_time_limit' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:300'],
            'safe_content_filter' => ['sometimes', 'boolean'],
            'disable_story_sharing' => ['sometimes', 'boolean'],
            'moderate_language' => ['sometimes', 'boolean'],
        ];
    }
}