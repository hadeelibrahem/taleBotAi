<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;

class HadeelAdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::query()->updateOrCreate(
            ['email' => 'hadeel@talebot.ai'],
            [
                'full_name' => 'Hadeel',
                'password' => 'hadeel12345',
                'role' => 'super admin',
                'avatar' => null,
                'is_active' => true,
            ]
        );
    }
}
