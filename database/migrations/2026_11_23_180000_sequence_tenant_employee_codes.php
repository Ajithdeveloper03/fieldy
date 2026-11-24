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
        if (Schema::hasTable('companies') && ! Schema::hasColumn('companies', 'employee_sequence')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->unsignedBigInteger('employee_sequence')->default(0);
            });
        }

        DB::transaction(function () {
            $defaultCompany = DB::table('companies')->where('code', 'INF-ORG')->first(['id', 'code']);
            $employees = DB::table('users')->leftJoin('companies', 'companies.id', '=', 'users.company_id')
                ->where('users.role', 'employee')
                ->where(function ($query) use ($defaultCompany) {
                    $query->where(fn ($linked) => $linked->whereNotNull('companies.code')->where('companies.code', '<>', ''));
                    if ($defaultCompany) {
                        $query->orWhereNull('users.company_id');
                    }
                })
                ->select('users.id', 'users.company_id', 'companies.code');

            // Move old codes aside before assigning the new sequence, since codes are globally unique.
            (clone $employees)->chunkById(500, function ($rows) {
                foreach ($rows as $row) {
                    DB::table('employee_details')->where('user_id', $row->id)
                        ->update(['employee_code' => 'TEMP-'.Str::uuid()]);
                }
            }, 'users.id', 'id');

            $sequences = [];
            $assignCodes = function ($rows) use (&$sequences, $defaultCompany) {
                foreach ($rows as $row) {
                    $companyId = $row->company_id ?? $defaultCompany?->id;
                    $prefix = $row->code ?? $defaultCompany?->code;
                    if (! $companyId || ! $prefix) {
                        continue;
                    }
                    $sequence = $sequences[$companyId] ?? 0;
                    do {
                        $code = $prefix.'-EMP-'.str_pad((string) ++$sequence, 4, '0', STR_PAD_LEFT);
                    } while (DB::table('employee_details')->where('employee_code', $code)->exists());

                    DB::table('employee_details')->updateOrInsert(['user_id' => $row->id], ['employee_code' => $code]);
                    $sequences[$companyId] = $sequence;
                }
            };

            // Number employees with an assigned service first, then the legacy roster.
            (clone $employees)->whereNotNull('users.industry')->chunkById(500, $assignCodes, 'users.id', 'id');
            $employees->whereNull('users.industry')->chunkById(500, $assignCodes, 'users.id', 'id');

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
