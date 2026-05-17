<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SendReadingReminders extends Command
{
    protected $signature = 'reminders:reading';
    protected $description = 'Send reading reminders to parents if children have not read recently';

    public function handle()
    {
        $children = DB::table('child_profiles')
            ->join('user_settings', 'child_profiles.user_id', '=', 'user_settings.user_id')
            ->where('user_settings.reading_reminders', true)
            ->select(
                'child_profiles.id',
                'child_profiles.name',
                'child_profiles.user_id'
            )
            ->get();

        foreach ($children as $child) {
            $lastRead = DB::table('story_progress')
                ->where('child_id', $child->id)
                ->max('last_read_at');

            if ($lastRead && now()->diffInDays($lastRead) < 3) {
                continue;
            }

            $alreadySentToday = DB::table('notifications')
                ->where('user_id', $child->user_id)
                ->where('title', 'Reading Reminder 📚')
                ->whereDate('created_at', today())
                ->exists();

            if ($alreadySentToday) {
                continue;
            }

            DB::table('notifications')->insert([
                'user_id' => $child->user_id,
                'title' => 'Reading Reminder 📚',
                'message' => $child->name . ' has not read a story for a while. Maybe it is time for a new adventure!',
                'is_read' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->info('Reading reminders sent successfully.');
    }
}