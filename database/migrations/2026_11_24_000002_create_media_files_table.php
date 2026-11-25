<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('media_files')) {
            Schema::create('media_files', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('company_id')->nullable()->index();
                $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('visit_id')->nullable()->constrained('farmer_visits')->nullOnDelete();
                $table->foreignId('task_id')->nullable()->constrained('tasks')->nullOnDelete();
                $table->foreignId('farmer_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('category', 32)->default('image')->index(); // image | video | document
                $table->string('title', 190)->nullable();
                $table->string('original_name', 255);
                $table->string('stored_path', 500);
                $table->string('mime_type', 120)->nullable();
                $table->unsignedBigInteger('size_bytes')->default(0);
                $table->decimal('captured_latitude', 10, 7)->nullable();
                $table->decimal('captured_longitude', 10, 7)->nullable();
                $table->timestamps();

                $table->index(['company_id', 'category', 'created_at']);
                $table->index(['visit_id', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('media_files');
    }
};
