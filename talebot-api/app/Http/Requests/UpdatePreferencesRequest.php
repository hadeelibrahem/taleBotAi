<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePreferencesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fantasy_adventure_enabled' => ['sometimes', 'boolean'],
            'cartoon_style_enabled' => ['sometimes', 'boolean'],
            'new_story_suggestions' => ['sometimes', 'boolean'],
            'reading_reminders' => ['sometimes', 'boolean'],
            'account_updates' => ['sometimes', 'boolean'],
        ];
    }
}