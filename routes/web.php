<?php

use App\Http\Controllers\Admin\AlertsController;
use App\Http\Controllers\Admin\AttendanceController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EmployeeDirectoryController;
use App\Http\Controllers\Admin\FarmerController;
use App\Http\Controllers\Admin\FarmerDirectoryController;
use App\Http\Controllers\Admin\GlobalSearchController;
use App\Http\Controllers\Admin\LiveMonitorController;
use App\Http\Controllers\Admin\PaymentsController;
use App\Http\Controllers\Admin\PerformanceController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\TasksController;
use App\Http\Controllers\Admin\VisitController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\MediaFileController;
use App\Http\Controllers\PortalSessionController;
use Illuminate\Support\Facades\Route;

// Public Landing Page
Route::get('/', fn () => inertia('Landing'))->name('landing');
Route::get('/fieldy', fn () => inertia('Landing'));

// Support both domain-root URLs and local/sub-folder URLs such as /fieldy/admin.
foreach (['admin', 'fieldy/admin'] as $adminPrefix) {
    $routeNamePrefix = $adminPrefix === 'admin' ? '' : 'fieldy.';

    Route::prefix($adminPrefix)->name($routeNamePrefix)->group(function () {
        // ── Public: Auth ─────────────────────────────────────────────────────
        Route::get('/login', [LoginController::class, 'index'])->name('login');
        Route::post('/login', [LoginController::class, 'store'])->name('login.store');
        Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');
    });
}

// The /fieldy base-path helper prefixes image URLs during local `artisan serve`,
// where Apache's sub-folder rewrite is not available to serve public files.
Route::get('/fieldy/images/{path}', function (string $path) {
    $imagesDirectory = realpath(public_path('images'));
    $imagePath = $imagesDirectory ? realpath($imagesDirectory . DIRECTORY_SEPARATOR . $path) : false;

    abort_unless(
        $imagesDirectory && $imagePath && is_file($imagePath)
            && str_starts_with($imagePath, $imagesDirectory . DIRECTORY_SEPARATOR),
        404
    );

    return response()->file($imagePath);
})->where('path', '.*');

// ── Authenticated Portal Session Activity, Inactivity & Security Audit Routes ──────
foreach (['portal/session', 'fieldy/portal/session'] as $sessionPrefix) {
    Route::prefix($sessionPrefix)->middleware(['auth'])->group(function () {
        Route::post('/heartbeat', [PortalSessionController::class, 'heartbeat']);
        Route::post('/idle-event', [PortalSessionController::class, 'idleEvent']);
        Route::post('/timeout-logout', [PortalSessionController::class, 'timeoutLogout']);
        Route::get('/feed', [PortalSessionController::class, 'feed']);
    });
}

// ── Media Preview & Download Routes (Session Auth + Signed URLs for Mobile/Hostinger) ──
Route::get('/media/signed/{id}/view', [MediaFileController::class, 'signedView'])->name('media.signed.view');
Route::get('/media/signed/{id}/download', [MediaFileController::class, 'signedDownload'])->name('media.signed.download');
Route::get('/media/signed/visit/{id}/dossier', [MediaFileController::class, 'signedVisitDossier'])->name('media.signed.visit-dossier');
Route::get('/fieldy/media/signed/{id}/view', [MediaFileController::class, 'signedView']);
Route::get('/fieldy/media/signed/{id}/download', [MediaFileController::class, 'signedDownload']);
Route::get('/fieldy/media/signed/visit/{id}/dossier', [MediaFileController::class, 'signedVisitDossier']);

foreach (['media', 'fieldy/media'] as $mediaPrefix) {
    Route::prefix($mediaPrefix)->middleware(['auth'])->group(function () {
        Route::get('/{id}/view', [MediaFileController::class, 'view']);
        Route::get('/{id}/download', [MediaFileController::class, 'download']);
    });
}

// ── Superadmin Portal (Platform Owner) ──────────────────────────────────────────
Route::prefix('superadmin')->middleware(['auth', 'superadmin'])->group(function () {
    Route::get('/', fn () => redirect('/superadmin/dashboard'));
    Route::get('/dashboard', [\App\Http\Controllers\Superadmin\SuperadminDashboardController::class, 'index'])->name('superadmin.dashboard');

    // Company Management & Deep Inspection
    Route::get('/companies', [\App\Http\Controllers\Superadmin\CompanyManagementController::class, 'index'])->name('superadmin.companies.index');
    Route::post('/companies', [\App\Http\Controllers\Superadmin\CompanyManagementController::class, 'store'])->name('superadmin.companies.store');
    Route::get('/companies/{id}', [\App\Http\Controllers\Superadmin\CompanyManagementController::class, 'show'])->name('superadmin.companies.show');
    Route::put('/companies/{id}', [\App\Http\Controllers\Superadmin\CompanyManagementController::class, 'update'])->name('superadmin.companies.update');
    Route::post('/companies/{id}/toggle-status', [\App\Http\Controllers\Superadmin\CompanyManagementController::class, 'toggleStatus'])->name('superadmin.companies.toggle');
    Route::post('/companies/{id}/impersonate', [\App\Http\Controllers\Superadmin\CompanyManagementController::class, 'impersonate'])->name('superadmin.companies.impersonate');

    // Cross-Company Employee & Activity Monitoring
    Route::get('/employees', [\App\Http\Controllers\Superadmin\SuperadminMonitoringController::class, 'employees'])->name('superadmin.employees');
    Route::get('/analytics', [\App\Http\Controllers\Superadmin\SuperadminMonitoringController::class, 'analytics'])->name('superadmin.analytics');

    // Platform Plans, Editions & Multi-Tenant Add-on Marketplace
    Route::get('/subscriptions', fn () => inertia('Superadmin/Subscriptions'))->name('superadmin.subscriptions');
});

// Compatibility routes for local installs opened at http://localhost/fieldy.
// Apache subfolder deployments strip this prefix before Laravel; artisan serve does not.
Route::prefix('fieldy/superadmin')->middleware(['auth', 'superadmin'])->group(function () {
    Route::get('/', fn () => redirect('/superadmin/dashboard'));
    Route::get('/dashboard', [\App\Http\Controllers\Superadmin\SuperadminDashboardController::class, 'index']);
    Route::get('/companies', [\App\Http\Controllers\Superadmin\CompanyManagementController::class, 'index']);
    Route::post('/companies', [\App\Http\Controllers\Superadmin\CompanyManagementController::class, 'store']);
    Route::get('/companies/{id}', [\App\Http\Controllers\Superadmin\CompanyManagementController::class, 'show']);
    Route::put('/companies/{id}', [\App\Http\Controllers\Superadmin\CompanyManagementController::class, 'update']);
    Route::post('/companies/{id}/toggle-status', [\App\Http\Controllers\Superadmin\CompanyManagementController::class, 'toggleStatus']);
    Route::post('/companies/{id}/impersonate', [\App\Http\Controllers\Superadmin\CompanyManagementController::class, 'impersonate']);
    Route::get('/employees', [\App\Http\Controllers\Superadmin\SuperadminMonitoringController::class, 'employees']);
    Route::get('/analytics', [\App\Http\Controllers\Superadmin\SuperadminMonitoringController::class, 'analytics']);
    Route::get('/subscriptions', fn () => inertia('Superadmin/Subscriptions'));
});

foreach (['admin', 'fieldy/admin'] as $adminPrefix) {
    $routeNamePrefix = $adminPrefix === 'admin' ? '' : 'fieldy.';

    Route::prefix($adminPrefix)->name($routeNamePrefix)->group(function () use ($adminPrefix) {

    // ── Protected: All admin routes require auth + admin role ─────────────────
    Route::middleware(['auth', 'admin'])->group(function () {

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
        Route::get('/company-logo', [DashboardController::class, 'companyLogo'])->name('admin.company-logo');
        Route::post('/onboarding-tour/complete', [DashboardController::class, 'completeOnboardingTour'])->name('admin.onboarding-tour.complete');
        Route::get('/', fn () => redirect('/admin/dashboard'));

        // Alerts
        Route::get('/alerts', [AlertsController::class, 'index'])->name('alerts.index');

        // Global Search
        Route::get('/search', [GlobalSearchController::class, 'search'])->name('global.search');

        // Employee Management
        Route::get('/employees', [EmployeeDirectoryController::class, 'index'])->name('employees.index');
        Route::get('/employees/create', [EmployeeDirectoryController::class, 'create'])->name('employees.create');
        Route::post('/employees', [EmployeeDirectoryController::class, 'store'])->name('employees.store');
        Route::get('/employees/{id}', [EmployeeDirectoryController::class, 'show'])->name('employees.show');
        Route::get('/employees/{id}/edit', [EmployeeDirectoryController::class, 'edit'])->name('employees.edit');
        Route::get('/employees/{id}/photo', [EmployeeDirectoryController::class, 'photo'])->name('employees.photo');
        Route::put('/employees/{id}', [EmployeeDirectoryController::class, 'update'])->name('employees.update');
        Route::delete('/employees/{id}', [EmployeeDirectoryController::class, 'destroy'])->name('employees.destroy');
        Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');

        // Farmer / Project Site CRUD Management
        Route::get('/farmers', [FarmerDirectoryController::class, 'index'])->name('farmers.index');
        Route::get('/farmers/register', [FarmerDirectoryController::class, 'create'])->name('farmers.register');
        Route::post('/farmers', [FarmerDirectoryController::class, 'store'])->name('farmers.store');
        Route::get('/farmers/{id}', [FarmerDirectoryController::class, 'show'])->name('farmers.show');
        Route::put('/farmers/{id}', [FarmerDirectoryController::class, 'update'])->name('farmers.update');
        Route::post('/farmers/{id}', [FarmerDirectoryController::class, 'update'])->name('farmers.update.post');
        Route::delete('/farmers/{id}', [FarmerDirectoryController::class, 'destroy'])->name('farmers.destroy');

        // Hidden routes redirected to dashboard
        Route::get('/pending-farmers', fn () => redirect('/admin/dashboard'))->name('farmers.pending');
        Route::get('/pending-farmers/{id}', fn () => redirect('/admin/dashboard'))->name('farmers.pending.show');
        Route::get('/settings', fn () => redirect('/admin/dashboard'))->name('settings.index');
        Route::get('/payments', fn () => redirect('/admin/dashboard'))->name('payments.index');

        // Visit Audits
        Route::get('/visits', [VisitController::class, 'index'])->name('visits.index');
        Route::get('/visits/{id}', [VisitController::class, 'show'])->name('visits.show');
        Route::get('/visits/{id}/dossier', [MediaFileController::class, 'downloadVisitDossier'])->name('visits.dossier');

        // Image, Video & Document Media Vault (Upload / List / Delete)
        Route::get('/media', [MediaFileController::class, 'index'])->name('media.index');
        Route::post('/media/upload', [MediaFileController::class, 'upload'])->name('media.upload');
        Route::delete('/media/{id}', [MediaFileController::class, 'destroy'])->name('media.destroy');
        // Performance Analytics
        Route::get('/performance', [PerformanceController::class, 'index'])->name('performance.index');

        // Task Management
        Route::get('/tasks', [TasksController::class, 'index'])->name('tasks.index');
        Route::post('/tasks', [TasksController::class, 'store'])->name('tasks.store');
        Route::put('/tasks/{id}', [TasksController::class, 'update'])->name('tasks.update');
        Route::delete('/tasks/{id}', [TasksController::class, 'destroy'])->name('tasks.destroy');

        // Live Monitor (page + JSON polling endpoint)
        Route::get('/monitor', [LiveMonitorController::class, 'index'])->name('monitor.index');
        Route::get('/monitor/live', [LiveMonitorController::class, 'liveData'])->name('monitor.live');

        // Redirect legacy /admin/subscriptions to Client Admin Dashboard (Plans & Add-ons moved to Superadmin)
        Route::get('/subscriptions', fn () => redirect('/admin/dashboard'))->name('admin.subscriptions');

        // Redirect legacy /admin/satisfaction to dashboard
        Route::get('/satisfaction', fn () => redirect('/admin/dashboard'))->name('admin.satisfaction');
    });
    });
}
