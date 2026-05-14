<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoryRating extends Model
{
    protected $table = 'story_ratings';

    protected $fillable = [
        'child_id',
        'story_id',
        'rating',
    ];

    public $timestamps = false;

    public function story()
    {
        return $this->belongsTo(Story::class);
    }

    public function child()
    {
        return $this->belongsTo(ChildProfile::class, 'child_id');
    }
}