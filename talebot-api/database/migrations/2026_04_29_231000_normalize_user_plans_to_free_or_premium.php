<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->whereNotIn('plan', ['free', 'premium', 'unlimited'])
            ->update(['plan' => 'premium']);
    }

    public function down(): void
    {
        //
    }
};
