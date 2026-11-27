<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class EmployeePhotoService
{
    public const RULE = 'required|image|mimes:jpg,jpeg,png,webp|max:5120';

    public function replace(User $employee, UploadedFile $photo): string
    {
        $disk = Storage::disk('local');
        $path = $photo->store('employee-photos', 'local');
        if (! $path) {
            throw ValidationException::withMessages(['photo' => 'The profile photo could not be saved.']);
        }

        try {
            $previous = DB::transaction(function () use ($employee, $path) {
                $locked = User::whereKey($employee->id)->lockForUpdate()->firstOrFail();
                $previous = $locked->employeeDetail?->photo_path;
                app(EmployeeCodeService::class)->ensure($locked, ['photo_path' => $path]);

                return $previous;
            });
        } catch (\Throwable $exception) {
            $disk->delete($path);
            throw $exception;
        }

        if ($previous && str_starts_with($previous, 'employee-photos/')) {
            $disk->delete($previous);
        }

        return basename($path);
    }

    public function response(User $employee)
    {
        $path = $employee->employeeDetail?->photo_path;
        $disk = Storage::disk('local');
        abort_unless($path && str_starts_with($path, 'employee-photos/') && $disk->exists($path), 404);

        return $disk->response($path, headers: [
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
