<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class AdminPaymentController extends Controller
{
    private const DEFAULT_PLANS = [
        'free' => [
            'name' => 'Free',
            'monthly_price' => 0,
            'story_limit' => 3,
            'image_limit' => 0,
            'child_profile_limit' => 1,
            'features' => ['Basic story generation', 'Standard illustration styles'],
        ],
        'premium' => [
            'name' => 'Premium',
            'monthly_price' => 9.99,
            'story_limit' => null,
            'image_limit' => 50,
            'child_profile_limit' => 5,
            'features' => ['Child photo character reference', 'Premium story controls', 'Priority image generation'],
        ],
        'unlimited' => [
            'name' => 'Unlimited',
            'monthly_price' => 20,
            'story_limit' => null,
            'image_limit' => null,
            'child_profile_limit' => null,
            'features' => ['Unlimited story generation', 'Unlimited image generation', 'Unlimited child profiles', 'Child photo character reference'],
        ],
    ];

    public function index(): JsonResponse
    {
        $planSettings = $this->planSettings();
        $users = User::query()
            ->withCount(['stories', 'childProfiles'])
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (User $user) => $this->formatSubscription($user, $planSettings))
            ->values();

        $premiumUsers = $users->whereIn('planKey', ['premium', 'unlimited'])->where('paymentStatus', 'Active')->count();
        $paidUsers = $users->filter(fn ($user) => ($user['monthlyPrice'] ?? 0) > 0 && $user['paymentStatus'] === 'Active')->count();
        $monthlyRevenue = $users->filter(fn ($user) => $user['paymentStatus'] === 'Active')->sum('monthlyPrice');
        $childrenCount = DB::table('child_profiles')->count();
        $premiumSettingsCount = DB::table('premium_settings')->count();
        $premiumFeatureUsage = $childrenCount > 0 ? round(($premiumSettingsCount / $childrenCount) * 100) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'premiumUsers' => $premiumUsers,
                    'paidUsers' => $paidUsers,
                    'monthlyRevenue' => round($monthlyRevenue, 2),
                    'premiumFeatureUsage' => $premiumFeatureUsage,
                    'totalUsers' => $users->count(),
                ],
                'plans' => $this->planBreakdown($users, $planSettings),
                'subscriptions' => $users,
            ],
        ]);
    }

    public function updatePlanSettings(Request $request, string $plan): JsonResponse
    {
        if (strtolower((string) $request->user()?->role) !== 'super admin') {
            return response()->json([
                'success' => false,
                'message' => 'Only super admins can update plan settings.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'monthly_price' => ['required', 'numeric', 'min:0', 'max:99999'],
            'story_limit' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'image_limit' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'child_profile_limit' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:255'],
        ]);

        if (! array_key_exists($plan, self::DEFAULT_PLANS)) {
            return response()->json([
                'success' => false,
                'message' => 'Unknown plan.',
            ], 404);
        }

        DB::table('plan_settings')->updateOrInsert(
            ['key' => $plan],
            [
                'name' => $validated['name'],
                'monthly_price' => $validated['monthly_price'],
                'story_limit' => $validated['story_limit'] ?? null,
                'image_limit' => $validated['image_limit'] ?? null,
                'child_profile_limit' => $validated['child_profile_limit'] ?? null,
                'features' => json_encode(array_values($validated['features'] ?? [])),
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $planSettings = $this->planSettings();
        $users = User::query()->get()->map(fn (User $user) => [
            'planKey' => strtolower($user->plan ?: 'free'),
        ]);

        return response()->json([
            'success' => true,
            'data' => collect($this->planBreakdown($users, $planSettings))
                ->firstWhere('key', $plan),
        ]);
    }

    public function updatePlan(Request $request, User $user): JsonResponse
    {
        if (strtolower((string) $request->user()?->role) !== 'super admin') {
            return response()->json([
                'success' => false,
                'message' => 'Only super admins can change user plans.',
            ], 403);
        }

        $validated = $request->validate([
            'plan' => ['required', Rule::in(array_keys(self::DEFAULT_PLANS))],
        ]);

        $this->applyPlanChange($user, $validated['plan']);

        $user->loadCount(['stories', 'childProfiles']);

        return response()->json([
            'success' => true,
            'data' => $this->formatSubscription($user, $this->planSettings()),
        ]);
    }

    public function renewSubscription(Request $request, User $user): JsonResponse
    {
        if (strtolower((string) $request->user()?->role) !== 'super admin') {
            return response()->json([
                'success' => false,
                'message' => 'Only super admins can renew subscriptions.',
            ], 403);
        }

        $plan = strtolower($user->plan ?: 'free');

        if ($plan === 'free' || ! array_key_exists($plan, self::DEFAULT_PLANS)) {
            return response()->json([
                'success' => false,
                'message' => 'Free accounts do not need monthly renewal.',
            ], 422);
        }

        $this->renewPaidPlan($user, $plan);
        $user->loadCount(['stories', 'childProfiles']);

        return response()->json([
            'success' => true,
            'data' => $this->formatSubscription($user, $this->planSettings()),
        ]);
    }

    private function planBreakdown($users, array $planSettings): array
    {
        return collect($planSettings)
            ->map(function (array $settings, string $plan) use ($users) {
                $count = $users->where('planKey', $plan)->count();
                $price = (float) $settings['monthly_price'];

                return [
                    'key' => $plan,
                    'name' => $settings['name'],
                    'users' => $count,
                    'price' => $price,
                    'monthlyRevenue' => round($count * $price, 2),
                    'storyLimit' => $settings['story_limit'],
                    'imageLimit' => $settings['image_limit'],
                    'childProfileLimit' => $settings['child_profile_limit'],
                    'features' => $settings['features'],
                ];
            })
            ->values()
            ->all();
    }

    private function formatSubscription(User $user, array $planSettings): array
    {
        $plan = strtolower($user->plan ?: 'free');
        $plan = array_key_exists($plan, $planSettings) ? $plan : 'premium';
        $price = (float) ($planSettings[$plan]['monthly_price'] ?? 0);
        $paymentStatus = $this->paymentStatus($user, $plan);
        $status = ($user->status ?: 'Active') === 'Banned' ? 'Suspended' : $paymentStatus;

        return [
            'id' => $user->id,
            'name' => $user->full_name ?: $user->email,
            'email' => $user->email,
            'plan' => ucfirst($plan),
            'planKey' => $plan,
            'monthlyPrice' => $price,
            'monthlyPriceLabel' => '$'.number_format($price, 2),
            'paymentStatus' => $paymentStatus,
            'status' => $status,
            'stories' => (int) ($user->stories_count ?? 0),
            'children' => (int) ($user->child_profiles_count ?? 0),
            'joinedAt' => optional($user->created_at)?->format('M d, Y'),
            'renewsAt' => optional($user->plan_renews_at)?->format('M d, Y'),
            'expiresAt' => optional($user->plan_expires_at)?->format('M d, Y'),
            'lastPaymentAt' => optional($user->last_payment_at)?->format('M d, Y'),
            'lastUpdated' => optional($user->updated_at)?->diffForHumans() ?? 'Never',
        ];
    }

    private function applyPlanChange(User $user, string $plan): void
    {
        if ($plan === 'free') {
            $user->update([
                'plan' => 'free',
                'plan_started_at' => null,
                'plan_renews_at' => null,
                'plan_expires_at' => null,
                'last_payment_at' => null,
                'payment_status' => 'free',
            ]);

            return;
        }

        $user->plan = $plan;
        $this->renewPaidPlan($user, $plan, true);
    }

    private function renewPaidPlan(User $user, string $plan, bool $isPlanChange = false): void
    {
        $now = now();
        $baseDate = $user->plan_expires_at && $user->plan_expires_at->greaterThan($now)
            ? $user->plan_expires_at
            : $now;
        $nextRenewal = $baseDate->copy()->addMonth();

        $user->forceFill([
            'plan' => $plan,
            'plan_started_at' => $user->plan_started_at && ! $isPlanChange ? $user->plan_started_at : ($user->plan_started_at ?? $now),
            'plan_renews_at' => $nextRenewal,
            'plan_expires_at' => $nextRenewal,
            'last_payment_at' => $now,
            'payment_status' => 'active',
        ])->save();
    }

    private function paymentStatus(User $user, string $plan): string
    {
        if ($plan === 'free') {
            return 'Free';
        }

        if (($user->status ?: 'Active') === 'Banned') {
            return 'Suspended';
        }

        if ($user->plan_expires_at && $user->plan_expires_at->isPast()) {
            return 'Expired';
        }

        return ucfirst($user->payment_status ?: 'active');
    }

    private function planSettings(): array
    {
        if (! Schema::hasTable('plan_settings')) {
            return self::DEFAULT_PLANS;
        }

        $rows = DB::table('plan_settings')->get()->keyBy('key');

        return collect(self::DEFAULT_PLANS)
            ->map(function (array $defaults, string $key) use ($rows) {
                $row = $rows->get($key);

                if (! $row) {
                    return $defaults;
                }

                return [
                    'name' => $row->name,
                    'monthly_price' => (float) $row->monthly_price,
                    'story_limit' => $row->story_limit === null ? null : (int) $row->story_limit,
                    'image_limit' => $row->image_limit === null ? null : (int) $row->image_limit,
                    'child_profile_limit' => $row->child_profile_limit === null ? null : (int) $row->child_profile_limit,
                    'features' => json_decode($row->features ?? '[]', true) ?: [],
                ];
            })
            ->all();
    }
}
