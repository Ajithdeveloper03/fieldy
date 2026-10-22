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
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('industry')->default('facility_management')->after('priority');
            $table->string('work_order_code')->nullable()->after('id');
            $table->foreignId('customer_id')->nullable()->after('assigned_to')->constrained('users')->onDelete('set null');
            $table->text('ai_suggestions')->nullable()->after('description');
            $table->json('checklist')->nullable()->after('ai_suggestions');
            $table->json('safety_requirements')->nullable()->after('checklist');
            $table->string('customer_otp')->nullable()->after('status');
            $table->boolean('otp_verified')->default(false)->after('customer_otp');
            $table->json('before_photos')->nullable()->after('otp_verified');
            $table->json('after_photos')->nullable()->after('before_photos');
            $table->integer('points_awarded')->default(0)->after('after_photos');
        });

        Schema::table('farmer_visits', function (Blueprint $table) {
            $table->string('service_type')->default('facility_maintenance')->after('recommendations');
            $table->string('safety_checklist_status')->default('verified')->after('service_type');
            $table->string('customer_otp_verified')->nullable()->after('safety_checklist_status');
            $table->json('before_service_photos')->nullable()->after('customer_otp_verified');
            $table->json('after_service_photos')->nullable()->after('before_service_photos');
            $table->integer('performance_points')->default(25)->after('after_service_photos');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn([
                'industry',
                'work_order_code',
                'customer_id',
                'ai_suggestions',
                'checklist',
                'safety_requirements',
                'customer_otp',
                'otp_verified',
                'before_photos',
                'after_photos',
                'points_awarded',
            ]);
        });

        Schema::table('farmer_visits', function (Blueprint $table) {
            $table->dropColumn([
                'service_type',
                'safety_checklist_status',
                'customer_otp_verified',
                'before_service_photos',
                'after_service_photos',
                'performance_points',
            ]);
        });
    }
};
