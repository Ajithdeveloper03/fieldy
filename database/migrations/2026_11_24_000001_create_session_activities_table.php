<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('session_activities')) {
            Schema::create('session_activities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->unsignedBigInteger('company_id')->nullable()->index();
                $table->string('session_id', 120)->nullable()->index();
                $table->string('role', 32)->nullable();
                $table->string('event_type', 48)->index();
                $table->string('label', 190);
                $table->string('route_path', 255)->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->string('user_agent', 255)->nullable();
                $table->string('status', 32)->default('active')->index();
                $table->unsignedInteger('idle_seconds')->default(0);
                $table->json('meta')->nullable();
                $table->timestamps();

                $table->index(['company_id', 'created_at']);
                $table->index(['user_id', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('session_activities');
    }
};
