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
    Schema::create('story_pages', function (Blueprint $table) {
        $table->id();
        $table->foreignId('story_id')->constrained('stories')->onDelete('cascade');
        $table->integer('page_number');
        $table->text('text_content');
        $table->string('image_url');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pages_');
    }
};
