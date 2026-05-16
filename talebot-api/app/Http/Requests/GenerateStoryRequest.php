<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateStoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

   protected function prepareForValidation(): void
{
    $this->merge([
        'use_child_photo' => filter_var($this->use_child_photo, FILTER_VALIDATE_BOOLEAN),
    ]);
}

public function rules(): array
{
    return [
        'child_id' => ['required', 'integer', 'exists:child_profiles,id'],
        'child_name' => ['required', 'string', 'max:100'],
        'age' => ['required', 'string'],
        'moral_lesson' => ['required', 'string', 'max:100'],
        'story_length' => ['required', 'in:short,medium,long'],
        'language' => ['nullable', 'string', 'in:en,ar'],
        'genre' => ['required', 'string', 'max:100'],
        'illustration_style' => ['required', 'string', 'max:100'],

        'use_child_photo' => ['nullable', 'boolean'],
        'child_photo' => ['nullable', 'required_if:use_child_photo,true', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
    ];
}

    public function messages(): array
    {
        return [
            'child_photo.required_if' => 'Please upload a child photo when use_child_photo is enabled.',
            'child_photo.image' => 'The uploaded file must be an image.',
            'child_photo.mimes' => 'The child photo must be jpg, jpeg, png, or webp.',
            'child_photo.max' => 'The child photo must not exceed 5MB.',
        ];
    }
}
