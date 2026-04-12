<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens; // إضافة هذا السطر
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    // أضفنا HasApiTokens هنا
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * الحقول التي يسمح بتخزينها (يجب أن تطابق أسماء الحقول في جدول المايجريشن)
     */
    protected $fillable = [
        'full_name', // عدلناها من name إلى full_name لتناسب تصميمك
        'email',
        'password',
        'avatar',    // أضفنا avatar
        'plan',      // أضفنا plan
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}