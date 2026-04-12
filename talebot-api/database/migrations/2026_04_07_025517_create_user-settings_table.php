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
    Schema::create('user_settings', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        $table->boolean('new_story_suggestions')->default(true);
        $table->boolean('reading_reminders')->default(true);
        $table->boolean('account_updates')->default(true);
        $table->boolean('fantasy_adventure_enabled')->default(true);
        $table->boolean('cartoon_style_enabled')->default(true);
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
