<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('child_profiles', function (Blueprint $table) {
        $table->id(); 
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); 
        $table->string('name'); 
        $table->integer('age'); 
        $table->string('avatar')->nullable(); 
        $table->timestamps(); 
    });
}

    public function down(): void
{
    Schema::dropIfExists('child_profiles');
}
};
