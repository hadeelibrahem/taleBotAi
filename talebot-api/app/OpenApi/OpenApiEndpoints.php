<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Post(
    path: '/api/register',
    operationId: 'authRegister',
    summary: 'Register a parent user',
    tags: ['Auth'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\MediaType(
            mediaType: 'multipart/form-data',
            schema: new OA\Schema(
                required: ['full_name', 'email', 'password'],
                properties: [
                    new OA\Property(property: 'full_name', type: 'string', maxLength: 255),
                    new OA\Property(property: 'email', type: 'string', format: 'email', maxLength: 255),
                    new OA\Property(property: 'password', type: 'string', minLength: 8),
                    new OA\Property(property: 'avatar', type: 'string', format: 'binary', nullable: true),
                ]
            )
        )
    ),
    responses: [
        new OA\Response(response: 200, description: 'Registered', content: new OA\JsonContent(ref: '#/components/schemas/AuthTokenResponse')),
        new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
    ]
)]
#[OA\Post(
    path: '/api/login',
    operationId: 'authLogin',
    summary: 'Log in a parent user',
    tags: ['Auth'],
    requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['email', 'password'], properties: [
        new OA\Property(property: 'email', type: 'string', format: 'email'),
        new OA\Property(property: 'password', type: 'string'),
    ])),
    responses: [
        new OA\Response(response: 200, description: 'Logged in', content: new OA\JsonContent(ref: '#/components/schemas/AuthTokenResponse')),
        new OA\Response(response: 401, description: 'Invalid credentials', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
        new OA\Response(response: 403, description: 'Banned account', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
    ]
)]
#[OA\Post(
    path: '/api/forgot-password',
    operationId: 'forgotPassword',
    summary: 'Send a password reset link',
    tags: ['Auth'],
    requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['email'], properties: [
        new OA\Property(property: 'email', type: 'string', format: 'email'),
    ])),
    responses: [
        new OA\Response(response: 200, description: 'Reset link sent', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
        new OA\Response(response: 400, description: 'Email not found', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
        new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
    ]
)]
#[OA\Post(
    path: '/api/reset-password',
    operationId: 'resetPassword',
    summary: 'Reset a user password',
    tags: ['Auth'],
    requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['token', 'email', 'password', 'password_confirmation'], properties: [
        new OA\Property(property: 'token', type: 'string'),
        new OA\Property(property: 'email', type: 'string', format: 'email'),
        new OA\Property(property: 'password', type: 'string', minLength: 8),
        new OA\Property(property: 'password_confirmation', type: 'string', minLength: 8),
    ])),
    responses: [
        new OA\Response(response: 200, description: 'Password reset', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
        new OA\Response(response: 400, description: 'Reset failed', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
        new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
    ]
)]
#[OA\Post(
    path: '/api/admin/login',
    operationId: 'adminLogin',
    summary: 'Log in an admin',
    tags: ['Admin Auth'],
    requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['email', 'password'], properties: [
        new OA\Property(property: 'email', type: 'string', format: 'email'),
        new OA\Property(property: 'password', type: 'string'),
    ])),
    responses: [
        new OA\Response(response: 200, description: 'Logged in', content: new OA\JsonContent(ref: '#/components/schemas/AuthTokenResponse')),
        new OA\Response(response: 401, description: 'Invalid credentials', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
        new OA\Response(response: 403, description: 'Inactive admin', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
        new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
    ]
)]
#[OA\Post(
    path: '/api/admin/register',
    operationId: 'adminRegister',
    summary: 'Create an admin account',
    security: [['bearerAuth' => []]],
    tags: ['Admin Auth'],
    requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['full_name', 'email', 'password', 'password_confirmation'], properties: [
        new OA\Property(property: 'full_name', type: 'string', maxLength: 255),
        new OA\Property(property: 'email', type: 'string', format: 'email'),
        new OA\Property(property: 'password', type: 'string', minLength: 8),
        new OA\Property(property: 'password_confirmation', type: 'string', minLength: 8),
    ])),
    responses: [
        new OA\Response(response: 201, description: 'Admin created', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
        new OA\Response(response: 401, description: 'Unauthenticated'),
        new OA\Response(response: 403, description: 'Super admin required', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
        new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
    ]
)]
#[OA\Get(path: '/api/admin/me', operationId: 'adminMe', summary: 'Get current admin', security: [['bearerAuth' => []]], tags: ['Admin Auth'], responses: [
    new OA\Response(response: 200, description: 'Current admin', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
])]
#[OA\Post(path: '/api/admin/logout', operationId: 'adminLogout', summary: 'Log out current admin', security: [['bearerAuth' => []]], tags: ['Admin Auth'], responses: [
    new OA\Response(response: 200, description: 'Logged out', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
])]
#[OA\Get(path: '/api/user', operationId: 'currentUser', summary: 'Get current authenticated user', security: [['bearerAuth' => []]], tags: ['Auth'], responses: [
    new OA\Response(response: 200, description: 'Current user', content: new OA\JsonContent(ref: '#/components/schemas/User')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
])]
#[OA\Get(path: '/api/password/reset/{token}', operationId: 'passwordResetRedirect', summary: 'Redirect password reset token to frontend', tags: ['Auth'], parameters: [
    new OA\Parameter(name: 'token', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
    new OA\Parameter(name: 'email', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'email')),
], responses: [
    new OA\Response(response: 302, description: 'Redirect to frontend reset page'),
])]

#[OA\Get(path: '/api/dashboard', operationId: 'dashboardIndex', summary: 'Get parent dashboard', security: [['bearerAuth' => []]], tags: ['Dashboard'], responses: [
    new OA\Response(response: 200, description: 'Dashboard data', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
])]
#[OA\Get(path: '/api/children/{id}/dashboard', operationId: 'childDashboard', summary: 'Get a child dashboard', tags: ['Dashboard'], parameters: [
    new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], responses: [
    new OA\Response(response: 200, description: 'Child dashboard data', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 404, description: 'Child not found'),
])]

#[OA\Get(path: '/api/analytics/children', operationId: 'analyticsChildren', summary: 'List children for analytics', security: [['bearerAuth' => []]], tags: ['Analytics'], responses: [
    new OA\Response(response: 200, description: 'Children', content: new OA\JsonContent(type: 'array', items: new OA\Items(ref: '#/components/schemas/ChildProfile'))),
    new OA\Response(response: 401, description: 'Unauthenticated'),
])]
#[OA\Get(path: '/api/analytics/{childId}', operationId: 'analyticsForChild', summary: 'Get analytics for a child', security: [['bearerAuth' => []]], tags: ['Analytics'], parameters: [
    new OA\Parameter(name: 'childId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], responses: [
    new OA\Response(response: 200, description: 'Analytics payload', content: new OA\JsonContent(type: 'object')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 404, description: 'Child not found'),
])]

#[OA\Get(path: '/api/plans', operationId: 'plansIndex', summary: 'List subscription plans', tags: ['Settings'], responses: [
    new OA\Response(response: 200, description: 'Plans', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
])]
#[OA\Get(path: '/api/settings', operationId: 'settingsIndex', summary: 'Get account settings', security: [['bearerAuth' => []]], tags: ['Settings'], responses: [
    new OA\Response(response: 200, description: 'Settings', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
])]
#[OA\Put(path: '/api/settings/account', operationId: 'settingsUpdateAccount', summary: 'Update account settings', security: [['bearerAuth' => []]], tags: ['Settings'], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(properties: [
    new OA\Property(property: 'name', type: 'string', nullable: true, maxLength: 255),
    new OA\Property(property: 'email', type: 'string', format: 'email', nullable: true),
    new OA\Property(property: 'password', type: 'string', nullable: true, minLength: 8),
    new OA\Property(property: 'password_confirmation', type: 'string', nullable: true, minLength: 8),
])), responses: [
    new OA\Response(response: 200, description: 'Account updated', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Put(path: '/api/settings/preferences', operationId: 'settingsUpdatePreferences', summary: 'Update notification and reading preferences', security: [['bearerAuth' => []]], tags: ['Settings'], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(properties: [
    new OA\Property(property: 'new_story_suggestions', type: 'boolean'),
    new OA\Property(property: 'reading_reminders', type: 'boolean'),
    new OA\Property(property: 'account_updates', type: 'boolean'),
    new OA\Property(property: 'disable_story_sharing', type: 'boolean'),
    new OA\Property(property: 'reading_time_limits', type: 'boolean'),
])), responses: [
    new OA\Response(response: 200, description: 'Preferences updated', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Post(path: '/api/subscription/checkout', operationId: 'subscriptionCheckout', summary: 'Change subscription plan', security: [['bearerAuth' => []]], tags: ['Settings'], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['plan', 'payment_method'], properties: [
    new OA\Property(property: 'plan', type: 'string', enum: ['free', 'premium', 'unlimited']),
    new OA\Property(property: 'payment_method', type: 'string', enum: ['free', 'card', 'paypal', 'cash']),
])), responses: [
    new OA\Response(response: 200, description: 'Subscription updated', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Post(path: '/api/settings/children', operationId: 'settingsStoreChild', summary: 'Create child profile', security: [['bearerAuth' => []]], tags: ['Settings'], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['name', 'age'], properties: [
    new OA\Property(property: 'name', type: 'string', maxLength: 100),
    new OA\Property(property: 'age', type: 'integer', minimum: 1, maximum: 18),
    new OA\Property(property: 'avatar', type: 'string', nullable: true),
    new OA\Property(property: 'allow_photo_usage', type: 'boolean', nullable: true),
    new OA\Property(property: 'reading_time_limit', type: 'integer', nullable: true, minimum: 0, maximum: 300),
    new OA\Property(property: 'safe_content_filter', type: 'boolean', nullable: true),
    new OA\Property(property: 'disable_story_sharing', type: 'boolean', nullable: true),
    new OA\Property(property: 'moderate_language', type: 'boolean', nullable: true),
])), responses: [
    new OA\Response(response: 201, description: 'Child created', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 403, description: 'Plan child limit reached', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Put(path: '/api/settings/children/{id}', operationId: 'settingsUpdateChild', summary: 'Update child profile', security: [['bearerAuth' => []]], tags: ['Settings'], parameters: [
    new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(properties: [
    new OA\Property(property: 'name', type: 'string', maxLength: 100),
    new OA\Property(property: 'age', type: 'integer', minimum: 1, maximum: 18),
    new OA\Property(property: 'avatar', type: 'string', nullable: true),
    new OA\Property(property: 'allow_photo_usage', type: 'boolean'),
    new OA\Property(property: 'reading_time_limit', type: 'integer', nullable: true),
    new OA\Property(property: 'safe_content_filter', type: 'boolean'),
    new OA\Property(property: 'disable_story_sharing', type: 'boolean'),
    new OA\Property(property: 'moderate_language', type: 'boolean'),
])), responses: [
    new OA\Response(response: 200, description: 'Child updated', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 404, description: 'Child not found'),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Delete(path: '/api/settings/children/{id}', operationId: 'settingsDeleteChild', summary: 'Delete child profile', security: [['bearerAuth' => []]], tags: ['Settings'], parameters: [
    new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], responses: [
    new OA\Response(response: 200, description: 'Child deleted', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 404, description: 'Child not found'),
    new OA\Response(response: 409, description: 'Child has stories', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
])]
#[OA\Delete(path: '/api/settings/account/delete', operationId: 'settingsDeleteAccount', summary: 'Delete current account', security: [['bearerAuth' => []]], tags: ['Settings'], responses: [
    new OA\Response(response: 200, description: 'Account deleted', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 409, description: 'Account has stories', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
])]
#[OA\Post(path: '/api/children/{id}/login', operationId: 'settingsLoginChild', summary: 'Verify parent password to access child', security: [['bearerAuth' => []]], tags: ['Settings'], parameters: [
    new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['password'], properties: [
    new OA\Property(property: 'password', type: 'string'),
])), responses: [
    new OA\Response(response: 200, description: 'Access granted', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated or incorrect password'),
    new OA\Response(response: 404, description: 'Child not found'),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]

#[OA\Post(path: '/api/stories/generate', operationId: 'generateStory', summary: 'Generate a story', security: [['bearerAuth' => []]], tags: ['Stories'], requestBody: new OA\RequestBody(required: true, content: new OA\MediaType(mediaType: 'multipart/form-data', schema: new OA\Schema(required: ['child_id', 'child_name', 'age', 'moral_lesson', 'story_length', 'genre', 'illustration_style'], properties: [
    new OA\Property(property: 'child_id', type: 'integer'),
    new OA\Property(property: 'child_name', type: 'string', maxLength: 100),
    new OA\Property(property: 'age', type: 'string'),
    new OA\Property(property: 'moral_lesson', type: 'string', maxLength: 100),
    new OA\Property(property: 'story_length', type: 'string', enum: ['short', 'medium', 'long']),
    new OA\Property(property: 'genre', type: 'string', maxLength: 100),
    new OA\Property(property: 'illustration_style', type: 'string', maxLength: 100),
    new OA\Property(property: 'use_child_photo', type: 'boolean', nullable: true),
    new OA\Property(property: 'child_photo', type: 'string', format: 'binary', nullable: true),
]))), responses: [
    new OA\Response(response: 200, description: 'Story generated', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 403, description: 'Plan limit or premium feature restriction', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Get(path: '/api/stories', operationId: 'publicStoriesIndex', summary: 'List approved stories for a child', tags: ['Stories'], parameters: [
    new OA\Parameter(name: 'child_id', in: 'query', required: true, schema: new OA\Schema(type: 'integer')),
], responses: [
    new OA\Response(response: 200, description: 'Stories', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Get(path: '/api/stories/{id}', operationId: 'publicStoryShow', summary: 'Show public story reader payload', tags: ['Stories'], parameters: [
    new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], responses: [
    new OA\Response(response: 200, description: 'Story with chapters', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 404, description: 'Story not found'),
])]
#[OA\Get(path: '/api/children/{id}/stories', operationId: 'childStories', summary: 'List approved stories for child path', tags: ['Stories'], parameters: [
    new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], responses: [
    new OA\Response(response: 200, description: 'Stories', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
])]
#[OA\Get(path: '/api/children/{childId}/stories/{storyId}', operationId: 'childStoryShow', summary: 'Show an approved story for a child', tags: ['Stories'], parameters: [
    new OA\Parameter(name: 'childId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
    new OA\Parameter(name: 'storyId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], responses: [
    new OA\Response(response: 200, description: 'Story with chapters', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 404, description: 'Story not found'),
])]
#[OA\Put(path: '/api/story-pages/{id}', operationId: 'storyPageUpdate', summary: 'Update story page text', tags: ['Stories'], parameters: [
    new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['content'], properties: [
    new OA\Property(property: 'content', type: 'string'),
])), responses: [
    new OA\Response(response: 200, description: 'Page updated', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 404, description: 'Page not found'),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]

#[OA\Post(path: '/api/favorites', operationId: 'favoriteStore', summary: 'Add a story to favorites', tags: ['Favorites'], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['child_id', 'story_id'], properties: [
    new OA\Property(property: 'child_id', type: 'integer'),
    new OA\Property(property: 'story_id', type: 'integer'),
])), responses: [
    new OA\Response(response: 200, description: 'Added to favorites', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
])]
#[OA\Delete(path: '/api/favorites/{child_id}/{story_id}', operationId: 'favoriteDestroy', summary: 'Remove a favorite', tags: ['Favorites'], parameters: [
    new OA\Parameter(name: 'child_id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
    new OA\Parameter(name: 'story_id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], responses: [
    new OA\Response(response: 200, description: 'Removed from favorites', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
])]
#[OA\Get(path: '/api/favorites/check/{child_id}/{story_id}', operationId: 'favoriteCheck', summary: 'Check whether a story is favorited', tags: ['Favorites'], parameters: [
    new OA\Parameter(name: 'child_id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
    new OA\Parameter(name: 'story_id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], responses: [
    new OA\Response(response: 200, description: 'Favorite status', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
])]
#[OA\Post(path: '/api/story-ratings', operationId: 'storyRatingStore', summary: 'Save a story rating', tags: ['Story Ratings'], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['child_id', 'story_id', 'rating'], properties: [
    new OA\Property(property: 'child_id', type: 'integer'),
    new OA\Property(property: 'story_id', type: 'integer'),
    new OA\Property(property: 'rating', type: 'integer', minimum: 1, maximum: 5),
])), responses: [
    new OA\Response(response: 200, description: 'Rating saved', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Post(path: '/api/progress', operationId: 'progressStore', summary: 'Save reading progress', tags: ['Story Progress'], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['child_id', 'story_id', 'progress_percentage'], properties: [
    new OA\Property(property: 'child_id', type: 'integer'),
    new OA\Property(property: 'story_id', type: 'integer'),
    new OA\Property(property: 'progress_percentage', type: 'integer', minimum: 0, maximum: 100),
    new OA\Property(property: 'reading_time_minutes', type: 'integer', nullable: true),
])), responses: [
    new OA\Response(response: 200, description: 'Progress saved', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
])]
#[OA\Post(path: '/api/progress/reset', operationId: 'progressReset', summary: 'Reset reading progress', tags: ['Story Progress'], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['child_id', 'story_id'], properties: [
    new OA\Property(property: 'child_id', type: 'integer'),
    new OA\Property(property: 'story_id', type: 'integer'),
])), responses: [
    new OA\Response(response: 200, description: 'Progress reset', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
])]
#[OA\Get(path: '/api/progress/{child_id}/{story_id}', operationId: 'progressShow', summary: 'Get reading progress', tags: ['Story Progress'], parameters: [
    new OA\Parameter(name: 'child_id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
    new OA\Parameter(name: 'story_id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], responses: [
    new OA\Response(response: 200, description: 'Progress', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
])]
#[OA\Post(path: '/api/cartoon-voice', operationId: 'cartoonVoiceGenerate', summary: 'Generate cartoon voice audio', security: [['bearerAuth' => []]], tags: ['Voice'], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['text'], properties: [
    new OA\Property(property: 'text', type: 'string'),
])), responses: [
    new OA\Response(response: 200, description: 'Audio URL', content: new OA\JsonContent(type: 'object', properties: [new OA\Property(property: 'audio_url', type: 'string')])),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 403, description: 'Premium plan required'),
    new OA\Response(response: 500, description: 'Configuration or server error'),
    new OA\Response(response: 502, description: 'Typecast upstream error'),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Get(path: '/api/profile/{childId}', operationId: 'profileCurrent', summary: 'Get current user child profile summary', security: [['bearerAuth' => []]], tags: ['Profile'], parameters: [
    new OA\Parameter(name: 'childId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], responses: [
    new OA\Response(response: 200, description: 'Profile summary', content: new OA\JsonContent(type: 'object')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 404, description: 'Profile not found'),
])]
#[OA\Get(path: '/api/profile/{userid}/{childid}', operationId: 'profileShow', summary: 'Get profile summary by user and child id', tags: ['Profile'], parameters: [
    new OA\Parameter(name: 'userid', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
    new OA\Parameter(name: 'childid', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], responses: [
    new OA\Response(response: 200, description: 'Profile summary', content: new OA\JsonContent(type: 'object')),
    new OA\Response(response: 404, description: 'Profile not found'),
])]

#[OA\Get(path: '/api/admins/avatar/{path}', operationId: 'adminAvatar', summary: 'Serve admin avatar file', tags: ['Admins'], parameters: [
    new OA\Parameter(name: 'path', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
], responses: [
    new OA\Response(response: 200, description: 'Avatar file'),
    new OA\Response(response: 404, description: 'Avatar not found'),
])]
#[OA\Get(path: '/api/admins', operationId: 'adminIndex', summary: 'List admins', security: [['bearerAuth' => []]], tags: ['Admins'], responses: [
    new OA\Response(response: 200, description: 'Admins', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
])]
#[OA\Get(path: '/api/admins/current', operationId: 'adminCurrent', summary: 'Get current admin profile', security: [['bearerAuth' => []]], tags: ['Admins'], responses: [
    new OA\Response(response: 200, description: 'Current admin', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
])]
#[OA\Post(path: '/api/admins/current', operationId: 'adminUpdateCurrentPost', summary: 'Update current admin profile with optional avatar upload', security: [['bearerAuth' => []]], tags: ['Admins'], requestBody: new OA\RequestBody(required: true, content: new OA\MediaType(mediaType: 'multipart/form-data', schema: new OA\Schema(required: ['name', 'email'], properties: [
    new OA\Property(property: 'name', type: 'string', maxLength: 255),
    new OA\Property(property: 'email', type: 'string', format: 'email'),
    new OA\Property(property: 'avatar', type: 'string', format: 'binary', nullable: true),
    new OA\Property(property: 'password', type: 'string', nullable: true, minLength: 8),
    new OA\Property(property: 'password_confirmation', type: 'string', nullable: true, minLength: 8),
]))), responses: [
    new OA\Response(response: 200, description: 'Admin updated', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 404, description: 'No active admin'),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Patch(path: '/api/admins/current', operationId: 'adminUpdateCurrentPatch', summary: 'Update current admin profile', security: [['bearerAuth' => []]], tags: ['Admins'], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['name', 'email'], properties: [
    new OA\Property(property: 'name', type: 'string', maxLength: 255),
    new OA\Property(property: 'email', type: 'string', format: 'email'),
    new OA\Property(property: 'password', type: 'string', nullable: true, minLength: 8),
    new OA\Property(property: 'password_confirmation', type: 'string', nullable: true, minLength: 8),
])), responses: [
    new OA\Response(response: 200, description: 'Admin updated', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 404, description: 'No active admin'),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Patch(path: '/api/admins/{admin}/role', operationId: 'adminUpdateRole', summary: 'Update admin role', security: [['bearerAuth' => []]], tags: ['Admins'], parameters: [
    new OA\Parameter(name: 'admin', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['role'], properties: [
    new OA\Property(property: 'role', type: 'string', enum: ['admin', 'super admin']),
])), responses: [
    new OA\Response(response: 200, description: 'Role updated', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 403, description: 'Super admin required'),
    new OA\Response(response: 422, description: 'Validation or self-role change error'),
])]
#[OA\Get(path: '/api/admin/dashboard', operationId: 'adminDashboard', summary: 'Get admin dashboard', security: [['bearerAuth' => []]], tags: ['Admin Dashboard'], responses: [
    new OA\Response(response: 200, description: 'Dashboard', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
])]
#[OA\Get(path: '/api/logs', operationId: 'adminLogsIndex', summary: 'List Laravel log entries', security: [['bearerAuth' => []]], tags: ['Admin Logs'], responses: [
    new OA\Response(response: 200, description: 'Logs', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
])]
#[OA\Delete(path: '/api/logs', operationId: 'adminLogsDestroy', summary: 'Clear Laravel log file', security: [['bearerAuth' => []]], tags: ['Admin Logs'], responses: [
    new OA\Response(response: 200, description: 'Logs cleared', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
])]
#[OA\Get(path: '/api/payments', operationId: 'adminPaymentsIndex', summary: 'Get payment and subscription admin data', security: [['bearerAuth' => []]], tags: ['Admin Payments'], responses: [
    new OA\Response(response: 200, description: 'Payments', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
])]
#[OA\Patch(path: '/api/payments/plans/{plan}', operationId: 'adminUpdatePlanSettings', summary: 'Update plan settings', security: [['bearerAuth' => []]], tags: ['Admin Payments'], parameters: [
    new OA\Parameter(name: 'plan', in: 'path', required: true, schema: new OA\Schema(type: 'string', enum: ['free', 'premium', 'unlimited'])),
], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['name', 'monthly_price'], properties: [
    new OA\Property(property: 'name', type: 'string', maxLength: 100),
    new OA\Property(property: 'monthly_price', type: 'number', minimum: 0, maximum: 99999),
    new OA\Property(property: 'story_limit', type: 'integer', nullable: true, minimum: 0),
    new OA\Property(property: 'image_limit', type: 'integer', nullable: true, minimum: 0),
    new OA\Property(property: 'child_profile_limit', type: 'integer', nullable: true, minimum: 0),
    new OA\Property(property: 'features', type: 'array', nullable: true, items: new OA\Items(type: 'string', maxLength: 255)),
])), responses: [
    new OA\Response(response: 200, description: 'Plan updated', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 403, description: 'Super admin required'),
    new OA\Response(response: 404, description: 'Unknown plan'),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Patch(path: '/api/payments/users/{user}/plan', operationId: 'adminUpdateUserPlan', summary: 'Change a user plan', security: [['bearerAuth' => []]], tags: ['Admin Payments'], parameters: [
    new OA\Parameter(name: 'user', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['plan'], properties: [
    new OA\Property(property: 'plan', type: 'string', enum: ['free', 'premium', 'unlimited']),
])), responses: [
    new OA\Response(response: 200, description: 'Plan changed', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 403, description: 'Super admin required'),
    new OA\Response(response: 404, description: 'User not found'),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Post(path: '/api/payments/users/{user}/renew', operationId: 'adminRenewUserPlan', summary: 'Renew a paid user plan', security: [['bearerAuth' => []]], tags: ['Admin Payments'], parameters: [
    new OA\Parameter(name: 'user', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], responses: [
    new OA\Response(response: 200, description: 'Plan renewed', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 403, description: 'Super admin required'),
    new OA\Response(response: 404, description: 'User not found'),
    new OA\Response(response: 422, description: 'Free plan cannot be renewed'),
])]

#[OA\Get(path: '/api/users', operationId: 'adminUsersIndex', summary: 'List users for admin', security: [['bearerAuth' => []]], tags: ['Admin Users'], responses: [
    new OA\Response(response: 200, description: 'Users', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
])]
#[OA\Get(path: '/api/users/{user}', operationId: 'adminUsersShow', summary: 'Show user details for admin', security: [['bearerAuth' => []]], tags: ['Admin Users'], parameters: [
    new OA\Parameter(name: 'user', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], responses: [
    new OA\Response(response: 200, description: 'User detail', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 404, description: 'User not found'),
])]
#[OA\Patch(path: '/api/users/{user}/status', operationId: 'adminUsersUpdateStatus', summary: 'Update user status', security: [['bearerAuth' => []]], tags: ['Admin Users'], parameters: [
    new OA\Parameter(name: 'user', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['status'], properties: [
    new OA\Property(property: 'status', type: 'string', enum: ['Active', 'Banned']),
])), responses: [
    new OA\Response(response: 200, description: 'Status updated', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 404, description: 'User not found'),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Delete(path: '/api/users/{user}', operationId: 'adminUsersDestroy', summary: 'Delete user', security: [['bearerAuth' => []]], tags: ['Admin Users'], parameters: [
    new OA\Parameter(name: 'user', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], responses: [
    new OA\Response(response: 200, description: 'User deleted', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 404, description: 'User not found'),
    new OA\Response(response: 409, description: 'User has stories'),
])]

#[OA\Get(path: '/api/admin/stories', operationId: 'adminStoriesIndex', summary: 'List generated stories for admin', security: [['bearerAuth' => []]], tags: ['Admin Stories'], responses: [
    new OA\Response(response: 200, description: 'Stories', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
])]
#[OA\Get(path: '/api/admin/stories/{story}', operationId: 'adminStoriesShow', summary: 'Show story details and pages for admin', security: [['bearerAuth' => []]], tags: ['Admin Stories'], parameters: [
    new OA\Parameter(name: 'story', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], responses: [
    new OA\Response(response: 200, description: 'Story detail', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 404, description: 'Story not found'),
])]
#[OA\Patch(path: '/api/admin/stories/{story}/status', operationId: 'adminStoriesUpdateStatus', summary: 'Update story review status', security: [['bearerAuth' => []]], tags: ['Admin Stories'], parameters: [
    new OA\Parameter(name: 'story', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['status'], properties: [
    new OA\Property(property: 'status', type: 'string', enum: ['Pending', 'Approved', 'Rejected']),
])), responses: [
    new OA\Response(response: 200, description: 'Story status updated', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 404, description: 'Story not found'),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Get(path: '/api/admin/stories/images', operationId: 'adminStoryImagesIndex', summary: 'List generated story images for admin', security: [['bearerAuth' => []]], tags: ['Admin Story Images'], responses: [
    new OA\Response(response: 200, description: 'Story images', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
])]
#[OA\Patch(path: '/api/admin/stories/images/{storyPage}', operationId: 'adminStoryImagesUpdateStatus', summary: 'Update story image moderation status', security: [['bearerAuth' => []]], tags: ['Admin Story Images'], parameters: [
    new OA\Parameter(name: 'storyPage', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['status'], properties: [
    new OA\Property(property: 'status', type: 'string', enum: ['Pending', 'Approved', 'Rejected']),
])), responses: [
    new OA\Response(response: 200, description: 'Image status updated', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 404, description: 'Story page not found'),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Get(path: '/api/stories/images', operationId: 'legacyAdminStoryImagesIndex', summary: 'Legacy admin alias: list generated story images', security: [['bearerAuth' => []]], tags: ['Admin Story Images'], deprecated: true, responses: [
    new OA\Response(response: 200, description: 'Story images', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
])]
#[OA\Patch(path: '/api/stories/images/{storyPage}', operationId: 'legacyAdminStoryImagesUpdateStatus', summary: 'Legacy admin alias: update story image status', security: [['bearerAuth' => []]], tags: ['Admin Story Images'], deprecated: true, parameters: [
    new OA\Parameter(name: 'storyPage', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['status'], properties: [
    new OA\Property(property: 'status', type: 'string', enum: ['Pending', 'Approved', 'Rejected']),
])), responses: [
    new OA\Response(response: 200, description: 'Image status updated', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 404, description: 'Story page not found'),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
#[OA\Patch(path: '/api/stories/{story}/status', operationId: 'legacyAdminStoriesUpdateStatus', summary: 'Legacy admin alias: update story status', security: [['bearerAuth' => []]], tags: ['Admin Stories'], deprecated: true, parameters: [
    new OA\Parameter(name: 'story', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
], requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['status'], properties: [
    new OA\Property(property: 'status', type: 'string', enum: ['Pending', 'Approved', 'Rejected']),
])), responses: [
    new OA\Response(response: 200, description: 'Story status updated', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
    new OA\Response(response: 401, description: 'Unauthenticated'),
    new OA\Response(response: 404, description: 'Story not found'),
    new OA\Response(response: 422, description: 'Validation error', content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')),
])]
final class OpenApiEndpoints
{
}
