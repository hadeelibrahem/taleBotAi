<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('premium_settings', function (Blueprint $table) {
        $table->id();
        $table->foreignId('child_id')->constrained('child_profiles')->onDelete('cascade');
        $table->boolean('moderate_language')->default(false);
        $table->boolean('disable_story_sharing')->default(false);
        $table->boolean('safe_content_filter')->default(true);
        $table->integer('reading_time_limit_minutes')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
