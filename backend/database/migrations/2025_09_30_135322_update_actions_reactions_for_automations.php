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
        // Create automations table to connect actions and reactions
        Schema::create('automations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('trigger_service_id')->constrained('services')->onDelete('cascade');
            $table->foreignId('action_service_id')->constrained('services')->onDelete('cascade');
            $table->foreignId('action_id')->constrained()->onDelete('cascade');
            $table->foreignId('reaction_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->string('category')->nullable();
            $table->json('tags')->nullable();
            $table->integer('popularity')->default(0);
            $table->timestamps();
        });

        // Update actions table to be more generic
        Schema::table('actions', function (Blueprint $table) {
            $table->string('trigger_type')->nullable()->after('description'); // e.g., 'new_email', 'song_liked', etc.
            $table->json('trigger_config')->nullable()->after('trigger_type'); // Configuration for the trigger
        });

        // Update reactions table to be more generic  
        Schema::table('reactions', function (Blueprint $table) {
            $table->string('action_type')->nullable()->after('description'); // e.g., 'send_message', 'add_to_playlist', etc.
            $table->json('action_config')->nullable()->after('action_type'); // Configuration for the action
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('automations');
        
        Schema::table('actions', function (Blueprint $table) {
            $table->dropColumn(['trigger_type', 'trigger_config']);
        });

        Schema::table('reactions', function (Blueprint $table) {
            $table->dropColumn(['action_type', 'action_config']);
        });
    }
};
