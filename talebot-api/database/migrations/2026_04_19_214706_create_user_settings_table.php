<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->boolean('fantasy_adventure')->default(false);
            $table->boolean('cartoon_style')->default(false);
            $table->boolean('new_story_suggestions')->default(false);
            $table->boolean('reading_reminders')->default(false);
            $table->boolean('account_updates')->default(false);

            $table->boolean('moderate_language')->default(false);
            $table->boolean('disable_story_sharing')->default(false);
            $table->boolean('safe_content_filter')->default(false);
            $table->boolean('reading_time_limits')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};

