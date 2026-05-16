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
        'language',
        'illustration_style',
        'cover_image',
        'status',
    ];

    public function pages()
    {
        return $this->hasMany(StoryPage::class);
    }

    public function ratings()
    {
        return $this->hasMany(StoryRating::class);
    }

    public function progress()
    {
        return $this->hasMany(StoryProgress::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function child()
    {
        return $this->belongsTo(ChildProfile::class, 'child_id');
    }

    public function childProfile()
    {
        return $this->belongsTo(ChildProfile::class, 'child_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
