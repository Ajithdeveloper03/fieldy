<?php

namespace App\Services;

use App\Models\Company;
use App\Models\EmployeeDetail;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EmployeeCodeService
{
    public function ensure(User $employee, array $attributes = []): EmployeeDetail
    {
        return DB::transaction(function () use ($employee, $attributes) {
            // The legacy organization and unassigned accounts share the plain EMP sequence.
            $company = $employee->company_id
                ? Company::withTrashed()->whereKey($employee->company_id)->lockForUpdate()->firstOrFail()
                : Company::withTrashed()->where('code', 'INF-ORG')->lockForUpdate()->firstOrFail();

            $detail = EmployeeDetail::where('user_id', $employee->id)->first();
            if (! $detail || blank($detail->employee_code)) {
                $prefix = $company->code === 'INF-ORG' || blank($company->code) ? 'EMP' : $company->code.'-EMP';
                do {
                    $company->employee_sequence++;
                    $code = $prefix.'-'.str_pad((string) $company->employee_sequence, 4, '0', STR_PAD_LEFT);
                } while (EmployeeDetail::where('employee_code', $code)->exists());

                $company->save();
                $detail = $detail ?? new EmployeeDetail(['user_id' => $employee->id]);
                $detail->employee_code = $code;
            }

            $detail->fill($attributes);
            $detail->save();

            return $detail;
        });
    }
}
