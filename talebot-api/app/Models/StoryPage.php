<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoryPage extends Model
{
    protected $fillable = [
        'story_id',
        'page_number',
        'text_content',
        'image_url',
        'status',
        'moderation_status',
    ];

    public function story()
    {
        return $this->belongsTo(Story::class);
    }
}
