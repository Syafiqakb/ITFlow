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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();

            $table->string('ticket_number', 30)->unique();

            $table->string('title');

            $table->text('description');

            $table->foreignId('requester_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignId('category_id')
                ->constrained('ticket_categories')
                ->restrictOnDelete();

            $table->foreignId('priority_id')
                ->constrained('ticket_priorities')
                ->restrictOnDelete();

            $table->foreignId('status_id')
                ->constrained('ticket_statuses')
                ->restrictOnDelete();

            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('due_at')->nullable();

            $table->timestamp('resolved_at')->nullable();

            $table->timestamp('closed_at')->nullable();

            $table->timestamps();

            $table->index('requester_id');
            $table->index('assigned_to');
            $table->index('status_id');
            $table->index('priority_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
