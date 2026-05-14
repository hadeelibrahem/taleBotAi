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
use Illuminate\Support\Facades\Hash;

class SettingsController extends Controller
{
    private function currentUser(): User
    {
        return User::findOrFail(1);
    }

    public function index(): JsonResponse
    {
        $user = $this->currentUser();

        $settings = UserSetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'fantasy_adventure_enabled' => false,
                'cartoon_style_enabled' => false,
                'new_story_suggestions' => false,
                'reading_reminders' => false,
                'account_updates' => false,
            ]
        );

        $children = ChildProfile::where('user_id', $user->id)->get();

        return response()->json([
            'message' => 'Settings fetched successfully',
            'data' => [
                'account' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'plan' => $user->plan ?? 'Free',
                ],
                'preferences' => $settings,
                'children' => $children,
            ]
        ]);
    }

    public function updateAccount(UpdateAccountRequest $request): JsonResponse
    {
        $user = $this->currentUser();

        $user->name = $request->name ?? $user->name;
        $user->email = $request->email ?? $user->email;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'Account updated successfully',
            'data' => $user
        ]);
    }

    public function updatePreferences(UpdatePreferencesRequest $request): JsonResponse
    {
        $user = $this->currentUser();

        $settings = UserSetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'fantasy_adventure_enabled' => false,
                'cartoon_style_enabled' => false,
                'new_story_suggestions' => false,
                'reading_reminders' => false,
                'account_updates' => false,
            ]
        );

        $settings->update($request->validated());

        return response()->json([
            'message' => 'Preferences updated successfully',
            'data' => $settings
        ]);
    }

    public function storeChild(StoreChildProfileRequest $request): JsonResponse
    {
        $user = $this->currentUser();

        $child = ChildProfile::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'age' => $request->age,
            'avatar' => $request->avatar,
            'reading_time_limit' => $request->reading_time_limit,
            'safe_content_filter' => $request->safe_content_filter ?? false,
            'disable_story_sharing' => $request->disable_story_sharing ?? false,
            'moderate_language' => $request->moderate_language ?? false,
        ]);

        return response()->json([
            'message' => 'Child profile created successfully',
            'data' => $child
        ], 201);
    }

    public function updateChild(UpdateChildProfileRequest $request, int $id): JsonResponse
    {
        $user = $this->currentUser();

        $child = ChildProfile::where('user_id', $user->id)->findOrFail($id);

        $child->update($request->validated());

        return response()->json([
            'message' => 'Child profile updated successfully',
            'data' => $child
        ]);
    }

    public function deleteChild(int $id): JsonResponse
    {
        $user = $this->currentUser();

        $child = ChildProfile::where('user_id', $user->id)->findOrFail($id);
        $child->delete();

        return response()->json([
            'message' => 'Child profile deleted successfully'
        ]);
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        $user = $this->currentUser();

        ChildProfile::where('user_id', $user->id)->delete();
        UserSetting::where('user_id', $user->id)->delete();
        $user->delete();

        return response()->json([
            'message' => 'Account deleted successfully'
        ]);
    }


    public function loginChild(Request $request, int $id): JsonResponse
{
    $request->validate([
        'password' => ['required', 'string'],
    ]);

    $user = $this->currentUser();

    if (!Hash::check($request->password, $user->password)) {
        return response()->json([
            'message' => 'Incorrect password'
        ], 401);
    }

    $child = ChildProfile::where('user_id', $user->id)->findOrFail($id);

    return response()->json([
        'message' => 'Access granted',
        'data' => $child
    ]);
}
}