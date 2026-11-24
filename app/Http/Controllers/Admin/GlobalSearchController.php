<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FarmerProfile;
use App\Models\User;
use Illuminate\Http\Request;

class GlobalSearchController extends Controller
{
    public function search(Request $request)
    {
        $query = \App\Support\SqlSafe::cleanInput((string) $request->input('q', ''), 80);

        if (mb_strlen($query) < 2) {
            return response()->json([]);
        }

        $likeTerm = \App\Support\SqlSafe::likeTerm($query, 80);
        $companyId = auth()->user()?->company_id;
        $results = [];

        // Search Employees (scoped to current company)
        $employees = User::where('role', 'employee')
            ->when($companyId, fn ($q) => $q->where('company_id', $companyId))
            ->where(function ($q) use ($likeTerm) {
                $q->where('name', 'like', $likeTerm)
                    ->orWhere('phone', 'like', $likeTerm);
            })
            ->take(5)
            ->get();

        foreach ($employees as $employee) {
            $results[] = [
                'id' => $employee->id,
                'name' => $employee->name,
                'type' => 'Employee',
                'url' => "/admin/employees/{$employee->id}",
            ];
        }

        // Search Project Sites / Clients (scoped to current company)
        $farmers = FarmerProfile::query()
            ->when($companyId, fn ($q) => $q->whereHas('user', fn ($u) => $u->where('company_id', $companyId)))
            ->where(function ($q) use ($likeTerm) {
                $q->whereHas('user', function ($u) use ($likeTerm) {
                    $u->where('name', 'like', $likeTerm)
                        ->orWhere('phone', 'like', $likeTerm);
                })->orWhere('farmer_code', 'like', $likeTerm);
            })
            ->with('user')
            ->take(5)
            ->get();

        foreach ($farmers as $farmer) {
            $farmerId = $farmer->user_id ?? $farmer->id;
            $results[] = [
                'id' => $farmerId,
                'name' => $farmer->user->name ?? 'Unknown Farmer',
                'type' => 'Farmer',
                'url' => "/admin/farmers/{$farmerId}",
            ];
        }

        return response()->json($results);
    }
}
