<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    protected $table = 'favorites';

    protected $fillable = [
        'story_id',
        'child_id',
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