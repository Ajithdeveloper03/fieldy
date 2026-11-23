<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('farmer_profiles', function (Blueprint $table) {
            $table->string('assignment_mode')->default('all');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->index(['assignment_mode', 'assigned_to']);
        });
    }

    public function down(): void
    {
        Schema::table('farmer_profiles', function (Blueprint $table) {
            $table->dropIndex(['assignment_mode', 'assigned_to']);
            $table->dropForeign(['assigned_to']);
            $table->dropColumn(['assignment_mode', 'assigned_to']);
        });
    }
};
