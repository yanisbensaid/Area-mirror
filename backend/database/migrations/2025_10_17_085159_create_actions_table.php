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
        Schema::create('actions', function (Blueprint $table) {
            $table->id();
            $table->string('service_name'); // Gmail, YouTube, Twitch, etc.
            $table->string('action_key'); // new_email_received, video_liked, etc.
            $table->string('name'); // Human-readable name
            $table->text('description'); // Description of the action
            $table->json('parameters')->nullable(); // JSON describing required/optional parameters
            $table->boolean('active')->default(true); // Can be disabled
            $table->timestamps();

            // Unique constraint on service + action_key
            $table->unique(['service_name', 'action_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('actions');
    }
};
