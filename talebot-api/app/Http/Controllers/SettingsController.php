<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChildProfileRequest;
use App\Http\Requests\UpdateAccountRequest;
use App\Http\Requests\UpdateChildProfileRequest;
use App\Http\Requests\UpdatePreferencesRequest;
use App\Models\ChildProfile;
use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class SettingsController extends Controller
{
    private const DEFAULT_PLANS = [
        'free' => [
            'child_profile_limit' => 1,
        ],
        'premium' => [
            'child_profile_limit' => 5,
        ],
        'unlimited' => [
            'child_profile_limit' => null,
        ],
    ];

    private function currentUser(Request $request): User
    {
        return $request->user();
    }

    private function addNotification(User $user, string $title, string $message): void
    {
        $settings = UserSetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'new_story_suggestions' => false,
                'reading_reminders' => false,
                'account_updates' => false,
                'disable_story_sharing' => false,
                'reading_time_limits' => false,
            ]
        );

        if (!$settings->account_updates) {
            return;
        }

        DB::table('notifications')->insert([
            'user_id' => $user->id,
            'title' => $title,
            'message' => $message,
            'is_read' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $this->currentUser($request);

        $settings = UserSetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'new_story_suggestions' => false,
                'reading_reminders' => false,
                'account_updates' => false,
                'disable_story_sharing' => false,
                'reading_time_limits' => false,
            ]
        );

        $children = ChildProfile::where('user_id', $user->id)->get();

        $isExpired = $user->plan_expires_at && $user->plan_expires_at->isPast();
        $currentPlan = $isExpired ? 'free' : strtolower($user->plan ?? 'free');
        $childProfileLimit = $this->childProfileLimitFor($user);

        if ($isExpired) {
            $user->forceFill([
                'plan' => 'free',
                'payment_status' => 'expired',
            ])->save();
        }

        return response()->json([
            'message' => 'Settings fetched successfully',
            'data' => [
                'account' => [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'email' => $user->email,
                    'plan' => ucfirst($currentPlan),
                    'payment_status' => $isExpired
                        ? 'expired'
                        : ($user->payment_status ?? 'free'),
                    'plan_expires_at' => optional($user->plan_expires_at)?->toDateString(),
                ],
                'preferences' => $settings,
                'children' => $children,
                'plan_limits' => [
                    'child_profile_limit' => $childProfileLimit,
                    'current_child_profiles' => $children->count(),
                ],
            ],
        ]);
    }

    public function updateAccount(UpdateAccountRequest $request): JsonResponse
    {
        $user = $this->currentUser($request);

        $changes = [];

        if ($request->filled('name') && $request->name !== $user->full_name) {
            $changes[] = 'Name was updated from "' . $user->full_name . '" to "' . $request->name . '"';
            $user->full_name = $request->name;
        }

        if ($request->filled('email') && $request->email !== $user->email) {
            $changes[] = 'Email was updated from "' . $user->email . '" to "' . $request->email . '"';
            $user->email = $request->email;
        }

        if ($request->filled('password')) {
            $changes[] = 'Password was updated';
            $user->password = Hash::make($request->password);
        }

        $user->save();

        if (!empty($changes)) {
            $this->addNotification(
                $user,
                'Account Updated ⚙️',
                implode(', ', $changes)
            );
        }

        return response()->json([
            'message' => 'Account updated successfully',
            'data' => $user,
        ]);
    }

    public function updatePreferences(UpdatePreferencesRequest $request): JsonResponse
    {
        $user = $this->currentUser($request);

        $settings = UserSetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'new_story_suggestions' => false,
                'reading_reminders' => false,
                'account_updates' => false,
                'disable_story_sharing' => false,
                'reading_time_limits' => false,
            ]
        );

        $validated = $request->validated();
        $changes = [];

        foreach ($validated as $field => $newValue) {
            $oldValue = (bool) $settings->{$field};

            if ($oldValue !== (bool) $newValue) {
                $label = match ($field) {
                    'new_story_suggestions' => 'New Story Suggestions',
                    'reading_reminders' => 'Reading Reminders',
                    'account_updates' => 'Account Updates',
                    'disable_story_sharing' => 'Disable Story Sharing',
                    'reading_time_limits' => 'Reading Time Limits',
                    default => $field,
                };

                $changes[] = $label . ' changed from ' . ($oldValue ? 'ON' : 'OFF') . ' to ' . ((bool) $newValue ? 'ON' : 'OFF');
            }
        }

        $settings->update($validated);

        if (!empty($changes)) {
            $this->addNotification(
                $user,
                'Settings Changed 🔔',
                implode(', ', $changes)
            );
        }

        return response()->json([
            'message' => 'Preferences updated successfully',
            'data' => $settings,
        ]);
    }

    public function storeChild(StoreChildProfileRequest $request): JsonResponse
    {
        $user = $this->currentUser($request);
        $limit = $this->childProfileLimitFor($user);
        $currentChildProfiles = $user->childProfiles()->count();

        if ($limit !== null && $currentChildProfiles >= $limit) {
            return response()->json([
                'message' => "Your plan allows up to {$limit} child profiles.",
                'data' => [
                    'child_profile_limit' => $limit,
                    'current_child_profiles' => $currentChildProfiles,
                    'plan' => ucfirst($this->effectivePlanKey($user)),
                ],
            ], 403);
        }

        $child = ChildProfile::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'age' => $request->age,
            'avatar' => $request->avatar,
        ]);

        $this->addNotification(
            $user,
            'Child Profile Added 👶',
            'Added new child profile: ' . $child->name
        );

        return response()->json([
            'message' => 'Child profile created successfully',
            'data' => $child,
        ], 201);
    }

    public function updateChild(UpdateChildProfileRequest $request, int $id): JsonResponse
    {
        $user = $this->currentUser($request);

        $child = ChildProfile::where('user_id', $user->id)->findOrFail($id);

        $oldName = $child->name;
        $oldAge = $child->age;

        $child->update($request->validated());

        $changes = [];

        if ($request->filled('name') && $oldName !== $child->name) {
            $changes[] = 'Name changed from "' . $oldName . '" to "' . $child->name . '"';
        }

        if ($request->filled('age') && (int) $oldAge !== (int) $child->age) {
            $changes[] = 'Age changed from "' . $oldAge . '" to "' . $child->age . '"';
        }

        if (!empty($changes)) {
            $this->addNotification(
                $user,
                'Child Profile Updated 👶',
                'Updated ' . $child->name . ': ' . implode(', ', $changes)
            );
        }

        return response()->json([
            'message' => 'Child profile updated successfully',
            'data' => $child,
        ]);
    }

    public function deleteChild(Request $request, int $id): JsonResponse
    {
        $user = $this->currentUser($request);

        $child = ChildProfile::where('user_id', $user->id)->findOrFail($id);

        if ($child->stories()->exists()) {
            return response()->json([
                'message' => 'This child profile has stories. Move or delete the stories before deleting the child profile.',
            ], 409);
        }

        $childName = $child->name;

        $child->delete();

        $this->addNotification(
            $user,
            'Child Profile Deleted 🗑️',
            'Deleted child profile: ' . $childName
        );

        return response()->json([
            'message' => 'Child profile deleted successfully',
        ]);
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        $user = $this->currentUser($request);

        if ($user->stories()->exists()) {
            return response()->json([
                'message' => 'This account has stories. Move or export the stories before deleting the account.',
            ], 409);
        }

        ChildProfile::where('user_id', $user->id)->delete();
        UserSetting::where('user_id', $user->id)->delete();

        $user->delete();

        return response()->json([
            'message' => 'Account deleted successfully',
        ]);
    }

    public function loginChild(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $this->currentUser($request);

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Incorrect password',
            ], 401);
        }

        $child = ChildProfile::where('user_id', $user->id)->findOrFail($id);

        return response()->json([
            'message' => 'Access granted',
            'data' => $child,
        ]);
    }

    public function checkoutSubscription(Request $request): JsonResponse
    {
        $request->validate([
            'plan' => ['required', 'string', 'in:free,premium,unlimited'],
            'payment_method' => ['required', 'string', 'in:free,card,paypal,cash'],
        ]);

        $user = $this->currentUser($request);

        if ($request->plan === 'free') {
            $user->forceFill([
                'plan' => 'free',
                'plan_started_at' => null,
                'plan_renews_at' => null,
                'plan_expires_at' => null,
                'last_payment_at' => null,
                'payment_status' => 'free',
            ])->save();

            return response()->json([
                'message' => 'Switched to Free plan successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'email' => $user->email,
                    'plan' => 'Free',
                    'payment_status' => 'free',
                    'renews_at' => null,
                    'expires_at' => null,
                    'payment_method' => 'free',
                ],
            ]);
        }

        $now = now();
        $nextRenewal = $now->copy()->addMonth();

        $user->forceFill([
            'plan' => $request->plan,
            'plan_started_at' => $user->plan_started_at ?? $now,
            'plan_renews_at' => $nextRenewal,
            'plan_expires_at' => $nextRenewal,
            'last_payment_at' => $now,
            'payment_status' => 'active',
        ])->save();

        $this->addNotification(
            $user,
            'Subscription Updated 💳',
            'Subscription changed to ' . ucfirst($user->plan)
        );

        return response()->json([
            'message' => 'Subscription updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'email' => $user->email,
                'plan' => ucfirst($user->plan),
                'payment_status' => $user->payment_status,
                'renews_at' => optional($user->plan_renews_at)?->format('M d, Y'),
                'expires_at' => optional($user->plan_expires_at)?->format('M d, Y'),
                'payment_method' => $request->payment_method,
            ],
        ]);
    }

    public function plans(): JsonResponse
    {
        $plans = DB::table('plan_settings')
            ->orderByRaw("FIELD(`key`, 'free', 'premium', 'unlimited')")
            ->get()
            ->map(function ($plan) {
                return [
                    'key' => $plan->key,
                    'name' => $plan->name,
                    'monthly_price' => (float) $plan->monthly_price,
                    'story_limit' => $plan->story_limit,
                    'image_limit' => $plan->image_limit,
                    'child_profile_limit' => $plan->child_profile_limit,
                    'features' => json_decode($plan->features ?? '[]', true),
                ];
            });

        return response()->json([
            'message' => 'Plans fetched successfully',
            'data' => $plans,
        ]);
    }

    private function childProfileLimitFor(User $user): ?int
    {
        $planKey = $this->effectivePlanKey($user);
        $defaults = self::DEFAULT_PLANS[$planKey] ?? self::DEFAULT_PLANS['free'];

        if (! Schema::hasTable('plan_settings')) {
            return $defaults['child_profile_limit'];
        }

        $settings = DB::table('plan_settings')
            ->where('key', $planKey)
            ->first(['child_profile_limit']);

        if (! $settings) {
            return $defaults['child_profile_limit'];
        }

        return $settings->child_profile_limit === null
            ? null
            : (int) $settings->child_profile_limit;
    }

    private function effectivePlanKey(User $user): string
    {
        $planKey = strtolower((string) ($user->plan ?? 'free'));

        if (! array_key_exists($planKey, self::DEFAULT_PLANS)) {
            $planKey = 'free';
        }

        if ($planKey !== 'free' && $user->plan_expires_at && $user->plan_expires_at->isPast()) {
            return 'free';
        }

        if (($user->payment_status ?? null) === 'expired') {
            return 'free';
        }

        return $planKey;
    }
}
