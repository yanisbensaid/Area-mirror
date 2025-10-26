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
        Schema::create('user_service_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('service_name'); // 'telegram', 'gmail', 'github', etc.
            $table->text('access_token')->nullable(); // Encrypted API tokens
            $table->text('refresh_token')->nullable(); // For OAuth2 services
            $table->timestamp('expires_at')->nullable(); // Token expiration
            $table->json('additional_data')->nullable(); // Service-specific extra data (scopes, etc.)
            $table->boolean('is_active')->default(true); // Allow users to temporarily disable
            $table->timestamps();

            // Ensure one token per user per service
            $table->unique(['user_id', 'service_name']);

            // Index for quick lookups
            $table->index(['service_name', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_service_tokens');
    }
};
