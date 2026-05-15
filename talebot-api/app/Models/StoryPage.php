<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoryPage extends Model
{
    protected $table = 'story_pages';

    protected $fillable = [
        'story_id',
        'page_number',
        'text_content',
        'image_url',
        'status',
        'moderation_status',
    ];

    public $timestamps = false;

    public function story()
    {
        return $this->belongsTo(Story::class);
    }
}