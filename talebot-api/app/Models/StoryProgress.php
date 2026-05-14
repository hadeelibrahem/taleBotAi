<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoryProgress extends Model
{
    protected $table = 'story_progress';

    protected $fillable = [
        'story_id',
        'child_id',
        'progress_percentage',
        'reading_time_minutes',
        'last_read_at',
    ];

    public $timestamps = false;

    protected $casts = [
        'last_read_at' => 'datetime',
    ];

    public function story()
    {
        return $this->belongsTo(Story::class);
    }

    public function child()
    {
        return $this->belongsTo(ChildProfile::class, 'child_id');
    }
}