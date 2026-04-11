<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
{
    // 1. users
    $user = \App\Models\User::create([
        'full_name' => 'Ayah Radi',
        'email' => 's12218122@stu.najah.edu',
        'password' => bcrypt('123'),
        'plan' => 'premium',
        'avatar' => 'avatar.png'
    ]);

    // 2. child_profiles
    $child = \App\Models\ChildProfile::create([
        'user_id' => $user->id,
        'name' => 'Sami',
        'age' => 6,
        'avatar' => 'child_avatar.png'
    ]);

    // 3. stories
    $story = \App\Models\Story::create([
        'user_id' => $user->id,
        'child_id' => $child->id,
        'title' => 'The Brave Little Robot',
        'genre' => 'Science Fiction',
        'moral_lesson' => 'Helping others makes you a hero.',
        'story_length' => 'Short',
        'illustration_style' => 'Cartoon',
        'cover_image' => 'cover.jpg'
    ]);

    // 4. story_pages
    \App\Models\StoryPage::create([
        'story_id' => $story->id,
        'page_number' => 1,
        'text_content' => 'Once upon a time, there was a small robot living in a big city.',
        'image_url' => 'page1.png'
    ]);

    // 5. story_progress
    \App\Models\StoryProgress::create([
        'story_id' => $story->id,
        'child_id' => $child->id,
        'progress_percentage' => 50,
        'reading_time_minutes' => 5,
        'last_read_at' => now()
    ]);

    // 6. favorites
    \App\Models\Favorite::create([
        'child_id' => $child->id,
        'story_id' => $story->id
    ]);

    // 7. activities
    \App\Models\Activity::create([
        'user_id' => $user->id,
        'child_id' => $child->id,
        'story_id' => $story->id,
        'activity_type' => 'Quiz',
        'description' => 'Completed the story and answered the final question.'
    ]);

    // 8. user_settings
    \App\Models\UserSetting::create([
        'user_id' => $user->id,
        'new_story_suggestions' => true,
        'reading_reminders' => true,
        'account_updates' => true,
        'fantasy_adventure_enabled' => true,
        'cartoon_style_enabled' => true
    ]);

    // 9. premium_settings
    \App\Models\PremiumSetting::create([
        'child_id' => $child->id,
        'moderate_language' => false,
        'disable_story_sharing' => true,
        'safe_content_filter' => true,
        'reading_time_limit_minutes' => 30
    ]);

    // 10. story_ratings
    \App\Models\StoryRating::create([
        'child_id' => $child->id,
        'story_id' => $story->id,
        'rating' => 5
    ]);

    // 11. ai_insights
    \App\Models\AiInsight::create([
        'user_id' => $user->id,
        'child_id' => $child->id,
        'popular_theme' => 'Space Exploration',
        'suggested_moral' => 'Persistence leads to success.',
        'completion_rate' => 100,
        'avg_rating' => 4.5
    ]);
}
}
