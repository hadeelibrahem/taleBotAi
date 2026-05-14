<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSetting extends Model
{
    protected $fillable = [
        'user_id',
        'fantasy_adventure_enabled',
        'cartoon_style_enabled',
        'new_story_suggestions',
        'reading_reminders',
        'account_updates',
    ];
}