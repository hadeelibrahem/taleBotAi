<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminAuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        if (strtolower((string) $request->user()?->role) !== 'super admin') {
            return response()->json([
                'message' => 'Only super admins can create admin accounts.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:admins,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $admin = Admin::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin',
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admin account created.',
            'data' => $this->formatAdmin($admin),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $admin = Admin::where('email', $request->email)->first();

        if (! $admin || ! Hash::check($request->password, $admin->password)) {
            return response()->json(['message' => 'Invalid admin login details'], 401);
        }

        if (! $admin->is_active) {
            return response()->json(['message' => 'This admin account is inactive.'], 403);
        }

        return $this->tokenResponse($admin);
    }

    public function current(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->formatAdmin($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Admin logged out.',
        ]);
    }

    private function tokenResponse(Admin $admin, int $status = 200): JsonResponse
    {
        $token = $admin->createToken('admin_auth_token', ['admin'])->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'admin' => $this->formatAdmin($admin),
        ], $status);
    }

    private function formatAdmin(Admin $admin): array
    {
        return [
            'id' => $admin->id,
            'name' => $admin->full_name,
            'email' => $admin->email,
            'role' => $admin->role,
            'avatar' => $admin->avatar,
            'status' => $admin->is_active ? 'Active' : 'Inactive',
        ];
    }
}
