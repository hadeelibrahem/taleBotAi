<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'TaleBot AI API',
    description: 'OpenAPI documentation for the TaleBot AI Laravel API.'
)]
#[OA\Server(url: '/', description: 'Current application host')]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    description: 'Laravel Sanctum bearer token. Use: Bearer {token}',
    scheme: 'bearer',
    bearerFormat: 'JWT'
)]
#[OA\Schema(
    schema: 'ValidationError',
    type: 'object',
    properties: [
        new OA\Property(property: 'message', type: 'string', example: 'Validation failed'),
        new OA\Property(
            property: 'errors',
            type: 'object',
            additionalProperties: new OA\AdditionalProperties(
                type: 'array',
                items: new OA\Items(type: 'string')
            )
        ),
    ]
)]
#[OA\Schema(
    schema: 'MessageResponse',
    type: 'object',
    properties: [
        new OA\Property(property: 'message', type: 'string', example: 'Operation completed successfully'),
    ]
)]
#[OA\Schema(
    schema: 'SuccessResponse',
    type: 'object',
    properties: [
        new OA\Property(property: 'success', type: 'boolean', example: true),
        new OA\Property(property: 'message', type: 'string', nullable: true, example: 'Operation completed successfully'),
        new OA\Property(property: 'data', nullable: true),
    ]
)]
#[OA\Schema(
    schema: 'AuthTokenResponse',
    type: 'object',
    properties: [
        new OA\Property(property: 'access_token', type: 'string', example: '1|sanctum-token'),
        new OA\Property(property: 'token_type', type: 'string', example: 'Bearer'),
        new OA\Property(property: 'user', ref: '#/components/schemas/User', nullable: true),
        new OA\Property(property: 'admin', ref: '#/components/schemas/Admin', nullable: true),
    ]
)]
#[OA\Schema(
    schema: 'User',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'full_name', type: 'string', nullable: true, example: 'Test User'),
        new OA\Property(property: 'name', type: 'string', nullable: true, example: 'Test User'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'test@example.com'),
        new OA\Property(property: 'avatar', type: 'string', nullable: true, example: 'avatars/default.jpg'),
        new OA\Property(property: 'plan', type: 'string', example: 'free'),
        new OA\Property(property: 'status', type: 'string', nullable: true, example: 'Active'),
    ]
)]
#[OA\Schema(
    schema: 'Admin',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'Admin User'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'admin@example.com'),
        new OA\Property(property: 'role', type: 'string', example: 'admin'),
        new OA\Property(property: 'avatar', type: 'string', nullable: true),
        new OA\Property(property: 'status', type: 'string', example: 'Active'),
        new OA\Property(property: 'joinedAt', type: 'string', nullable: true, example: 'May 15, 2026'),
        new OA\Property(property: 'lastUpdated', type: 'string', nullable: true, example: '2 hours ago'),
    ]
)]
#[OA\Schema(
    schema: 'ChildProfile',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'user_id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'Rashed'),
        new OA\Property(property: 'age', type: 'integer', example: 7),
        new OA\Property(property: 'avatar', type: 'string', nullable: true, example: 'avatar.png'),
        new OA\Property(property: 'allow_photo_usage', type: 'boolean', example: false),
    ]
)]
#[OA\Schema(
    schema: 'Story',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'title', type: 'string', example: 'Mera and the Brave Little Rabbit'),
        new OA\Property(property: 'genre', type: 'string', example: 'Animals'),
        new OA\Property(property: 'moral_lesson', type: 'string', nullable: true, example: 'Courage'),
        new OA\Property(property: 'story_length', type: 'string', nullable: true, example: 'medium'),
        new OA\Property(property: 'illustration_style', type: 'string', nullable: true, example: 'Sketch'),
        new OA\Property(property: 'cover_image', type: 'string', nullable: true),
        new OA\Property(property: 'status', type: 'string', nullable: true, example: 'Pending'),
    ]
)]
#[OA\Schema(
    schema: 'StoryPage',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'story_id', type: 'integer', example: 1),
        new OA\Property(property: 'page_number', type: 'integer', example: 1),
        new OA\Property(property: 'text_content', type: 'string', example: 'Once upon a time...'),
        new OA\Property(property: 'image_url', type: 'string', nullable: true),
        new OA\Property(property: 'status', type: 'string', nullable: true, example: 'Pending'),
        new OA\Property(property: 'moderation_status', type: 'string', nullable: true, example: 'Review'),
    ]
)]
#[OA\Schema(
    schema: 'AdminStory',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'title', type: 'string', example: 'Mera and the Brave Little Rabbit'),
        new OA\Property(property: 'genre', type: 'string', example: 'Animals'),
        new OA\Property(property: 'moralLesson', type: 'string', nullable: true, example: 'Courage'),
        new OA\Property(property: 'storyLength', type: 'string', example: 'medium'),
        new OA\Property(property: 'style', type: 'string', example: 'Sketch'),
        new OA\Property(property: 'coverImage', type: 'string', nullable: true),
        new OA\Property(property: 'author', type: 'string', example: 'Test User'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'test@example.com'),
        new OA\Property(property: 'childName', type: 'string', nullable: true, example: 'rashed'),
        new OA\Property(property: 'pageCount', type: 'integer', example: 5),
        new OA\Property(property: 'approvedPages', type: 'integer', example: 0),
        new OA\Property(property: 'pendingPages', type: 'integer', example: 5),
        new OA\Property(property: 'rejectedPages', type: 'integer', example: 0),
        new OA\Property(property: 'status', type: 'string', example: 'Pending'),
    ]
)]
#[OA\Schema(
    schema: 'Plan',
    type: 'object',
    properties: [
        new OA\Property(property: 'key', type: 'string', example: 'premium'),
        new OA\Property(property: 'name', type: 'string', example: 'Premium'),
        new OA\Property(property: 'monthly_price', type: 'number', format: 'float', example: 9.99),
        new OA\Property(property: 'story_limit', type: 'integer', nullable: true, example: null),
        new OA\Property(property: 'image_limit', type: 'integer', nullable: true, example: 50),
        new OA\Property(property: 'child_profile_limit', type: 'integer', nullable: true, example: 5),
        new OA\Property(property: 'features', type: 'array', items: new OA\Items(type: 'string')),
    ]
)]
#[OA\Schema(
    schema: 'Favorite',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'child_id', type: 'integer', example: 1),
        new OA\Property(property: 'story_id', type: 'integer', example: 1),
    ]
)]
#[OA\Schema(
    schema: 'StoryProgress',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'child_id', type: 'integer', example: 1),
        new OA\Property(property: 'story_id', type: 'integer', example: 1),
        new OA\Property(property: 'progress_percentage', type: 'integer', example: 75),
        new OA\Property(property: 'reading_time_minutes', type: 'integer', example: 12),
        new OA\Property(property: 'last_read_at', type: 'string', nullable: true, example: '2026-05-16 14:13:50'),
    ]
)]
#[OA\Schema(
    schema: 'StoryRating',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'child_id', type: 'integer', example: 1),
        new OA\Property(property: 'story_id', type: 'integer', example: 1),
        new OA\Property(property: 'rating', type: 'integer', minimum: 1, maximum: 5, example: 5),
    ]
)]
final class OpenApiSchemas
{
}
