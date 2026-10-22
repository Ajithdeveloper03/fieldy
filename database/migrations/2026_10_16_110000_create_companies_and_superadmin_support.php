<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create companies table
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('code')->unique()->nullable();
            $table->string('industry')->default('Agriculture & Field Services');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('logo')->nullable();
            $table->enum('plan', ['starter', 'professional', 'enterprise'])->default('professional');
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->integer('max_employees')->default(50);
            $table->date('subscription_expires_at')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Insert default company for existing data (Infinity Organics)
        $defaultCompanyId = DB::table('companies')->insertGetId([
            'name' => 'Infinity Organics',
            'slug' => 'infinity-organics',
            'code' => 'INF-ORG',
            'industry' => 'Agriculture & Field Services',
            'email' => 'admin@infinityorganics.com',
            'phone' => '9000000000',
            'address' => 'Coimbatore, Tamil Nadu, India',
            'plan' => 'enterprise',
            'status' => 'active',
            'max_employees' => 100,
            'subscription_expires_at' => now()->addYear(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Add company_id to users and update role to allow 'superadmin'
        Schema::table('users', function (Blueprint $table) use ($defaultCompanyId) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained('companies')->onDelete('cascade');
        });

        // Modify users role column to support 'superadmin'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('superadmin', 'admin', 'employee', 'farmer') NOT NULL DEFAULT 'employee'");

        // Assign existing users to default company
        DB::table('users')->whereNull('company_id')->update(['company_id' => $defaultCompanyId]);

        // 4. Create default superadmin for project owner
        DB::table('users')->updateOrInsert(
            ['email' => 'superadmin@fieldy.in'],
            [
                'name' => 'Fieldy Owner (Superadmin)',
                'phone' => '9999999999',
                'password' => bcrypt('SuperAdmin@1234'),
                'role' => 'superadmin',
                'status' => 'active',
                'company_id' => null, // Superadmin is not tied to a single tenant company
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropColumn('company_id');
        });

        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'employee', 'farmer') NOT NULL DEFAULT 'employee'");

        Schema::dropIfExists('companies');
    }
};
