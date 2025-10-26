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
        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name'); // "YouTube to Telegram"
            $table->text('description')->nullable();
            $table->boolean('active')->default(false);

            // Action (Trigger) configuration
            $table->string('action_service'); // 'YouTube'
            $table->string('action_type'); // 'video_liked'
            $table->json('action_config')->nullable(); // Store last checked video IDs

            // Reaction (Response) configuration
            $table->string('reaction_service'); // 'Telegram'
            $table->string('reaction_type'); // 'send_message'
            $table->json('reaction_config')->nullable(); // Message template

            // Execution tracking
            $table->timestamp('last_checked_at')->nullable();
            $table->timestamp('last_triggered_at')->nullable();
            $table->integer('trigger_count')->default(0);

            $table->timestamps();

            $table->index(['user_id', 'active']);
            $table->index('last_checked_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('areas');
    }
};
