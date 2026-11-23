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
        Schema::create('knowledge_article_feedback', function (Blueprint $table) {
            $table->id();

            $table->foreignId('knowledge_article_id')
                ->constrained('knowledge_articles')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->boolean('helpful');

            $table->timestamps();

            $table->unique(['knowledge_article_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_article_feedback');
    }
};
