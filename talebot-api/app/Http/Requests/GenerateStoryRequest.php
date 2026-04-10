<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateStoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'child_name' => ['required', 'string', 'max:100'],
            'age' => ['required', 'string'],
            'moral_lesson' => ['required', 'string', 'max:100'],
            'story_length' => ['required', 'in:short,medium,long'],
            'genre' => ['required', 'string', 'max:100'],
            'illustration_style' => ['required', 'string', 'max:100'],
        ];
    }
}