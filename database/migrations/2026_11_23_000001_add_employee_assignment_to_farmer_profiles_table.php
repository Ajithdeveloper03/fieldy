<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('farmer_profiles')) {
            return;
        }

        $addMode = ! Schema::hasColumn('farmer_profiles', 'assignment_mode');
        $addAssigned = ! Schema::hasColumn('farmer_profiles', 'assigned_to');

        if ($addMode || $addAssigned) {
            Schema::table('farmer_profiles', function (Blueprint $table) use ($addMode, $addAssigned) {
                if ($addMode) {
                    $table->string('assignment_mode')->default('all');
                }
                if ($addAssigned) {
                    $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
                }
                if ($addMode && $addAssigned) {
                    $table->index(['assignment_mode', 'assigned_to']);
                }
            });
        }
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
