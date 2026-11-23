<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->unsignedBigInteger('employee_sequence')->default(0);
        });

        DB::transaction(function () {
            $employees = DB::table('users')->join('companies', 'companies.id', '=', 'users.company_id')
                ->where('users.role', 'employee')->whereNotNull('companies.code')->where('companies.code', '<>', '')
                ->select('users.id', 'users.company_id', 'companies.code');

            // Move old codes aside before assigning the new sequence, since codes are globally unique.
            (clone $employees)->chunkById(500, function ($rows) {
                foreach ($rows as $row) {
                    DB::table('employee_details')->where('user_id', $row->id)
                        ->update(['employee_code' => 'TEMP-'.Str::uuid()]);
                }
            }, 'users.id', 'id');

            $sequences = [];
            $employees->chunkById(500, function ($rows) use (&$sequences) {
                foreach ($rows as $row) {
                    $sequence = $sequences[$row->company_id] ?? 0;
                    do {
                        $code = $row->code.'-EMP-'.str_pad((string) ++$sequence, 4, '0', STR_PAD_LEFT);
                    } while (DB::table('employee_details')->where('employee_code', $code)->exists());

                    DB::table('employee_details')->updateOrInsert(['user_id' => $row->id], ['employee_code' => $code]);
                    $sequences[$row->company_id] = $sequence;
                }
            }, 'users.id', 'id');

            foreach ($sequences as $companyId => $sequence) {
                DB::table('companies')->where('id', $companyId)->update(['employee_sequence' => $sequence]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('employee_sequence');
        });
    }
};
