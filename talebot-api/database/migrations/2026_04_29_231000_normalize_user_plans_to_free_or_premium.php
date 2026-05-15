<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'plan')) {
            DB::table('users')
                ->whereNotIn('plan', ['free', 'premium', 'unlimited'])
                ->update(['plan' => 'premium']);
        }
    }

    public function down(): void
    {
        //
    }
};