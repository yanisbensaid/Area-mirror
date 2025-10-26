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
        Schema::create('reactions', function (Blueprint $table) {
            $table->id();
            $table->string('service_name'); // Gmail, Telegram, etc.
            $table->string('reaction_key'); // send_email, send_message, etc.
            $table->string('name'); // Human-readable name
            $table->text('description'); // Description of the reaction
            $table->json('parameters')->nullable(); // JSON describing required/optional parameters
            $table->boolean('active')->default(true); // Can be disabled
            $table->timestamps();

            // Unique constraint on service + reaction_key
            $table->unique(['service_name', 'reaction_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reactions');
    }
};
