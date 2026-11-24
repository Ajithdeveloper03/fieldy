<?php

namespace App\Console\Commands;

use App\Models\FarmerProfile;
use App\Models\User;
use App\Services\EmployeeCodeService;
use Illuminate\Console\Command;

class GenerateUniqueIds extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'system:generate-ids';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate unique IDs for existing approved farmers and employees';

    /**
     * Execute the console command.
     */
    public function handle(EmployeeCodeService $employeeCodes)
    {
        $this->info('Generating unique IDs...');

        // Employees
        $employees = User::where('role', 'employee')->get();
        $employeeCount = 0;
        foreach ($employees as $employee) {
            if (blank($employee->employeeDetail?->employee_code)) {
                $employeeCodes->ensure($employee);
                $employeeCount++;
            }
        }
        $this->info("Generated IDs for {$employeeCount} employees.");

        // Farmers
        $farmers = User::where('role', 'farmer')->where('status', 'active')->get();
        $farmerCount = 0;
        foreach ($farmers as $farmer) {
            $profile = FarmerProfile::where('user_id', $farmer->id)->where('approval_status', 'approved')->first();
            if ($profile && empty($profile->farmer_code)) {
                $district = $profile->district ?? 'CBE';
                $prefix = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $district), 0, 3));
                if (strlen($prefix) < 3) {
                    $prefix = str_pad($prefix, 3, 'X');
                }
                $code = $prefix.'-FMR-'.str_pad($farmer->id, 3, '0', STR_PAD_LEFT);
                $profile->farmer_code = $code;
                $profile->save();
                $farmerCount++;
            }
        }
        $this->info("Generated IDs for {$farmerCount} farmers.");

        $this->info('Done.');
    }
}
