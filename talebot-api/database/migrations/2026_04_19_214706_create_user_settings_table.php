<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('user_settings')) {
            Schema::table('user_settings', function (Blueprint $table) {
                if (!Schema::hasColumn('user_settings', 'fantasy_adventure')) {
                    $table->boolean('fantasy_adventure')->default(false)->after('user_id');
                }

                if (!Schema::hasColumn('user_settings', 'cartoon_style')) {
                    $table->boolean('cartoon_style')->default(false)->after('fantasy_adventure');
                }

                if (!Schema::hasColumn('user_settings', 'moderate_language')) {
                    $table->boolean('moderate_language')->default(false)->after('account_updates');
                }

                if (!Schema::hasColumn('user_settings', 'disable_story_sharing')) {
                    $table->boolean('disable_story_sharing')->default(false)->after('moderate_language');
                }

                if (!Schema::hasColumn('user_settings', 'safe_content_filter')) {
                    $table->boolean('safe_content_filter')->default(false)->after('disable_story_sharing');
                }

                if (!Schema::hasColumn('user_settings', 'reading_time_limits')) {
                    $table->boolean('reading_time_limits')->default(false)->after('safe_content_filter');
                }
            });

            return;
        }

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
