<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            $defaultCompany = DB::table('companies')->where('code', 'INF-ORG')->lockForUpdate()->first();
            if (! $defaultCompany) {
                return;
            }

            $employees = DB::table('users')->leftJoin('employee_details', 'employee_details.user_id', '=', 'users.id')
                ->where('users.role', 'employee')
                ->where(fn ($query) => $query->where('users.company_id', $defaultCompany->id)->orWhereNull('users.company_id'))
                ->orderByRaw('CASE WHEN users.industry IS NULL THEN 1 ELSE 0 END')
                ->orderBy('users.id')
                ->get(['users.id']);

            foreach ($employees as $employee) {
                DB::table('employee_details')->where('user_id', $employee->id)
                    ->update(['employee_code' => 'TEMP-'.Str::uuid()]);
            }

            $sequence = 0;
            foreach ($employees as $employee) {
                do {
                    $code = 'EMP-'.str_pad((string) ++$sequence, 4, '0', STR_PAD_LEFT);
                } while (DB::table('employee_details')->where('employee_code', $code)->exists());

                DB::table('employee_details')->updateOrInsert(['user_id' => $employee->id], ['employee_code' => $code]);
            }

            DB::table('companies')->where('id', $defaultCompany->id)
                ->update(['employee_sequence' => max($defaultCompany->employee_sequence, $sequence)]);
        });
    }

    public function down(): void
    {
        // Employee codes are persistent identifiers and remain valid after rollback.
    }
};
