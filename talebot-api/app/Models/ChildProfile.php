<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChildProfile extends Model
{
    protected $table = 'child_profiles';

    protected $fillable = [
        'user_id',
        'name',
        'age',
        'avatar',
    ];

    public function stories()
    {
        return $this->hasMany(Story::class, 'child_id');
    }

    public function ratings()
    {
        return $this->hasMany(StoryRating::class, 'child_id');
    }

    public function progress()
    {
        return $this->hasMany(StoryProgress::class, 'child_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}