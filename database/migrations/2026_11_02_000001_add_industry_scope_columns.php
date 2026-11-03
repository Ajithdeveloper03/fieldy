<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds an `industry` column to the tables that hold per-service records so that
 * every admin page can be scoped strictly to the selected service vertical.
 * NULL is treated as the default vertical (real_estate) for existing rows.
 */
return new class extends Migration
{
    private array $tables = ['users', 'farmer_profiles', 'farmer_visits', 'payments'];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            if (Schema::hasTable($table) && ! Schema::hasColumn($table, 'industry')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->string('industry', 40)->nullable()->index();
                });
            }
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'industry')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropIndex(['industry']);
                    $t->dropColumn('industry');
                });
            }
        }
    }
};
