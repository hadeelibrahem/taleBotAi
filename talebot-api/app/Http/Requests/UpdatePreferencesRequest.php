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
            'new_story_suggestions' => ['sometimes', 'boolean'],
            'reading_reminders' => ['sometimes', 'boolean'],
            'account_updates' => ['sometimes', 'boolean'],
            'disable_story_sharing' => ['sometimes', 'boolean'],
            'reading_time_limits' => ['sometimes', 'boolean'],
        ];
    }
}