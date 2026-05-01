<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Story extends Model
{
    protected $fillable = [
        'user_id',
        'child_id',
        'title',
        'genre',
        'moral_lesson',
        'story_length',
        'illustration_style',
        'cover_image',
        'status',
    ];

    public function pages()
    {
        return $this->hasMany(StoryPage::class);
    }
}
