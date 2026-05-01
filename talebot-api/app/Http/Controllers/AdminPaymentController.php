<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminPaymentController extends Controller
{
    private const PLAN_PRICES = [
        'free' => 0,
        'premium' => 9.99,
    ];

    public function index(): JsonResponse
    {
        $users = User::query()
            ->withCount(['stories', 'childProfiles'])
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (User $user) => $this->formatSubscription($user))
            ->values();

        $premiumUsers = $users->where('planKey', 'premium')->count();
        $paidUsers = $users->filter(fn ($user) => ($user['monthlyPrice'] ?? 0) > 0)->count();
        $monthlyRevenue = $users->sum('monthlyPrice');
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
                'plans' => $this->planBreakdown($users),
                'subscriptions' => $users,
            ],
        ]);
    }

    public function updatePlan(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'plan' => ['required', 'in:free,premium'],
        ]);

        $user->update([
            'plan' => $validated['plan'],
        ]);

        $user->loadCount(['stories', 'childProfiles']);

        return response()->json([
            'success' => true,
            'data' => $this->formatSubscription($user),
        ]);
    }

    private function planBreakdown($users): array
    {
        return collect(self::PLAN_PRICES)
            ->map(function (float $price, string $plan) use ($users) {
                $count = $users->where('planKey', $plan)->count();

                return [
                    'key' => $plan,
                    'name' => ucfirst($plan),
                    'users' => $count,
                    'price' => $price,
                    'monthlyRevenue' => round($count * $price, 2),
                ];
            })
            ->values()
            ->all();
    }

    private function formatSubscription(User $user): array
    {
        $plan = strtolower($user->plan ?: 'free');
        $plan = array_key_exists($plan, self::PLAN_PRICES) ? $plan : 'premium';
        $price = self::PLAN_PRICES[$plan] ?? 0;
        $status = ($user->status ?: 'Active') === 'Banned' ? 'Suspended' : 'Active';

        return [
            'id' => $user->id,
            'name' => $user->full_name ?: $user->email,
            'email' => $user->email,
            'plan' => ucfirst($plan),
            'planKey' => $plan,
            'monthlyPrice' => $price,
            'monthlyPriceLabel' => '$'.number_format($price, 2),
            'status' => $status,
            'stories' => (int) ($user->stories_count ?? 0),
            'children' => (int) ($user->child_profiles_count ?? 0),
            'joinedAt' => optional($user->created_at)?->format('M d, Y'),
            'lastUpdated' => optional($user->updated_at)?->diffForHumans() ?? 'Never',
        ];
    }
}
