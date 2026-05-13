<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function index(): JsonResponse
    {
        $admins = Admin::query()
            ->orderByDesc('is_active')
            ->orderBy('full_name')
            ->get()
            ->map(fn (Admin $admin) => $this->formatAdmin($admin))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $admins,
        ]);
    }

    public function current(): JsonResponse
    {
        $admin = Admin::query()
            ->where('is_active', true)
            ->orderBy('id')
            ->first();

        return response()->json([
            'success' => true,
            'data' => $admin ? $this->formatAdmin($admin) : null,
        ]);
    }

    public function updateCurrent(Request $request): JsonResponse
    {
        $admin = Admin::query()
            ->where('is_active', true)
            ->orderBy('id')
            ->first();

        if (! $admin) {
            return response()->json([
                'success' => false,
                'message' => 'No active admin account was found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('admins', 'email')->ignore($admin->id),
            ],
            'role' => ['required', 'string', 'max:100'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $admin->full_name = $validated['name'];
        $admin->email = $validated['email'];
        $admin->role = $validated['role'];

        if ($request->hasFile('avatar')) {
            if ($admin->avatar && ! str_starts_with($admin->avatar, 'http') && Storage::disk('public')->exists($admin->avatar)) {
                Storage::disk('public')->delete($admin->avatar);
            }

            $admin->avatar = $request->file('avatar')->store('admin-avatars', 'public');
        }

        if (! empty($validated['password'])) {
            $admin->password = $validated['password'];
        }

        $admin->save();

        return response()->json([
            'success' => true,
            'data' => $this->formatAdmin($admin->fresh()),
        ]);
    }

    public function avatar(string $path)
    {
        abort_unless(str_starts_with($path, 'admin-avatars/'), 404);
        abort_unless(Storage::disk('public')->exists($path), 404);

        return response()->file(Storage::disk('public')->path($path));
    }

    private function formatAdmin(Admin $admin): array
    {
        return [
            'id' => $admin->id,
            'name' => $admin->full_name,
            'email' => $admin->email,
            'role' => $admin->role,
            'avatar' => $this->formatAvatarUrl($admin->avatar),
            'status' => $admin->is_active ? 'Active' : 'Inactive',
            'joinedAt' => optional($admin->created_at)?->format('M d, Y'),
            'lastUpdated' => optional($admin->updated_at)?->diffForHumans(),
        ];
    }

    private function formatAvatarUrl(?string $avatar): ?string
    {
        if (! $avatar) {
            return null;
        }

        if (str_starts_with($avatar, 'http')) {
            return $avatar;
        }

        return url('/api/admins/avatar/'.ltrim($avatar, '/'));
    }
}
