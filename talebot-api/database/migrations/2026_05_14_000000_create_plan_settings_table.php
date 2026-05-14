<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->decimal('monthly_price', 8, 2)->default(0);
            $table->unsignedInteger('story_limit')->nullable();
            $table->unsignedInteger('image_limit')->nullable();
            $table->unsignedInteger('child_profile_limit')->nullable();
            $table->json('features')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_settings');
    }
};
