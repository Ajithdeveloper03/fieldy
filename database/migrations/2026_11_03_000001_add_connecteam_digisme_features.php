<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Enhance attendance_logs with digiSME / Connecteam shift & geofence rules
        if (Schema::hasTable('attendance_logs')) {
            Schema::table('attendance_logs', function (Blueprint $table) {
                if (! Schema::hasColumn('attendance_logs', 'is_late')) {
                    $table->boolean('is_late')->default(false)->after('date');
                }
                if (! Schema::hasColumn('attendance_logs', 'late_minutes')) {
                    $table->integer('late_minutes')->default(0)->after('is_late');
                }
                if (! Schema::hasColumn('attendance_logs', 'is_early_checkout')) {
                    $table->boolean('is_early_checkout')->default(false)->after('late_minutes');
                }
                if (! Schema::hasColumn('attendance_logs', 'regular_hours')) {
                    $table->decimal('regular_hours', 5, 2)->default(0)->after('is_early_checkout');
                }
                if (! Schema::hasColumn('attendance_logs', 'overtime_hours')) {
                    $table->decimal('overtime_hours', 5, 2)->default(0)->after('regular_hours');
                }
                if (! Schema::hasColumn('attendance_logs', 'total_hours')) {
                    $table->decimal('total_hours', 5, 2)->default(0)->after('overtime_hours');
                }
                if (! Schema::hasColumn('attendance_logs', 'is_within_geofence')) {
                    $table->boolean('is_within_geofence')->default(true)->after('total_hours');
                }
                if (! Schema::hasColumn('attendance_logs', 'geofence_deviation_meters')) {
                    $table->integer('geofence_deviation_meters')->default(0)->after('is_within_geofence');
                }
                if (! Schema::hasColumn('attendance_logs', 'status')) {
                    $table->string('status', 30)->default('present')->after('geofence_deviation_meters');
                }
                if (! Schema::hasColumn('attendance_logs', 'approval_status')) {
                    $table->string('approval_status', 30)->default('approved')->after('status');
                }
                if (! Schema::hasColumn('attendance_logs', 'shift_name')) {
                    $table->string('shift_name', 80)->default('General Shift (09:00 - 18:00)')->after('approval_status');
                }
            });
        }

        // 2. Enhance location_points with device battery & stationary telemetry
        if (Schema::hasTable('location_points')) {
            Schema::table('location_points', function (Blueprint $table) {
                if (! Schema::hasColumn('location_points', 'battery_level')) {
                    $table->integer('battery_level')->nullable()->after('timestamp');
                }
                if (! Schema::hasColumn('location_points', 'activity_type')) {
                    $table->string('activity_type', 40)->nullable()->after('battery_level');
                }
            });
        }

        // 3. Create geofence_zones table if not already existing
        if (! Schema::hasTable('geofence_zones')) {
            Schema::create('geofence_zones', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');
                $table->string('name');
                $table->string('industry', 40)->nullable()->index();
                $table->decimal('latitude', 10, 7);
                $table->decimal('longitude', 10, 7);
                $table->integer('radius_meters')->default(200);
                $table->string('address')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('geofence_zones')) {
            Schema::dropIfExists('geofence_zones');
        }

        if (Schema::hasTable('attendance_logs')) {
            Schema::table('attendance_logs', function (Blueprint $table) {
                $cols = [
                    'is_late', 'late_minutes', 'is_early_checkout',
                    'regular_hours', 'overtime_hours', 'total_hours',
                    'is_within_geofence', 'geofence_deviation_meters',
                    'status', 'approval_status', 'shift_name'
                ];
                foreach ($cols as $col) {
                    if (Schema::hasColumn('attendance_logs', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }
};

