<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = [
        'user_id',
        'child_id',
        'story_id',
        'activity_type',
        'description',
    ];

    public function story()
    {
        return $this->belongsTo(Story::class);
    }

    public function childProfile()
    {
        return $this->belongsTo(ChildProfile::class, 'child_id');
    }
}