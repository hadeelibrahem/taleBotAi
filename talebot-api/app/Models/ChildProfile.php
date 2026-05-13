<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChildProfile extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'age',
        'avatar',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
