<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::create('attendees', function (Blueprint $table) {
        $table->id();
        $table->foreignId('event_id')->constrained()->cascadeOnDelete();
        $table->string('name', 100);
        $table->string('email', 150);
        $table->string('phone', 20)->nullable();
        $table->string('token', 40)->unique();
        $table->timestamp('checked_in_at')->nullable();
        $table->foreignId('checked_in_by')->nullable()->constrained('users')->nullOnDelete();
        $table->timestamps();

        $table->unique(['event_id', 'email']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendees');
    }
};
