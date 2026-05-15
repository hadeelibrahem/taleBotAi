<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('plan_started_at')->nullable();
            $table->timestamp('plan_renews_at')->nullable();
            $table->timestamp('plan_expires_at')->nullable();
            $table->timestamp('last_payment_at')->nullable();
            $table->string('payment_status')->default('free');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'plan_started_at',
                'plan_renews_at',
                'plan_expires_at',
                'last_payment_at',
                'payment_status',
            ]);
        });
    }
};