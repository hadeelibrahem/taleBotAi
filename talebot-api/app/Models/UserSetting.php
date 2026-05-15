<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSetting extends Model
{
    protected $fillable = [
        'user_id',
        'new_story_suggestions',
        'reading_reminders',
        'account_updates',
        'disable_story_sharing',
        'reading_time_limits',
    ];

    protected $casts = [
        'new_story_suggestions' => 'boolean',
        'reading_reminders' => 'boolean',
        'account_updates' => 'boolean',
        'disable_story_sharing' => 'boolean',
        'reading_time_limits' => 'boolean',
    ];
}