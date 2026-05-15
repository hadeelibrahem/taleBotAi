<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ChildProfilePlanLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_free_plan_cannot_create_more_than_one_child_profile(): void
    {
        $user = User::factory()->create([
            'plan' => 'free',
            'payment_status' => 'free',
        ]);

        $user->childProfiles()->create([
            'name' => 'Lina',
            'age' => 4,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/settings/children', [
            'name' => 'Mera',
            'age' => 8,
        ]);

        $response
            ->assertForbidden()
            ->assertJsonPath('data.child_profile_limit', 1)
            ->assertJsonPath('data.current_child_profiles', 1);

        $this->assertSame(1, $user->childProfiles()->count());
    }

    public function test_child_profile_limit_uses_configured_plan_settings(): void
    {
        DB::table('plan_settings')->insert([
            'key' => 'premium',
            'name' => 'Premium',
            'monthly_price' => 9.99,
            'story_limit' => null,
            'image_limit' => 50,
            'child_profile_limit' => 2,
            'features' => json_encode([]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $user = User::factory()->create([
            'plan' => 'premium',
            'payment_status' => 'active',
            'plan_expires_at' => now()->addMonth(),
        ]);

        $user->childProfiles()->createMany([
            ['name' => 'Lina', 'age' => 4],
            ['name' => 'Mera', 'age' => 8],
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/settings/children', [
            'name' => 'Adam',
            'age' => 6,
        ]);

        $response
            ->assertForbidden()
            ->assertJsonPath('data.child_profile_limit', 2)
            ->assertJsonPath('data.current_child_profiles', 2);

        $this->assertSame(2, $user->childProfiles()->count());
    }
}
