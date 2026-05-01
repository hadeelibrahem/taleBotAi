<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('story_pages', function (Blueprint $table) {
            $table->string('status')->default('Pending')->after('image_url');
            $table->string('moderation_status')->default('Review')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('story_pages', function (Blueprint $table) {
            $table->dropColumn(['status', 'moderation_status']);
        });
    }
};
