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
    Schema::create('story_progress', function (Blueprint $table) {
        $table->id();
        $table->foreignId('story_id')->constrained('stories')->onDelete('cascade');
        $table->foreignId('child_id')->constrained('child_profiles')->onDelete('cascade');
        $table->integer('progress_percentage');
        $table->integer('reading_time_minutes');
        $table->timestamp('last_read_at');
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
