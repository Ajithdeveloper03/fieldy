<?php

namespace App\Http\Middleware;

use App\Models\SessionActivity;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TrackSessionActivity
{
    public const DEFAULT_IDLE_TIMEOUT = 900; // 15 minutes server-enforced inactivity timeout

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $request->hasSession()) {
            return $next($request);
        }

        if (! in_array($user->role, ['admin', 'superadmin'], true)) {
            return $next($request);
        }

        $path = '/' . ltrim($request->path(), '/');
        $isPassiveEndpoint = str_contains($path, '/monitor/live')
            || str_contains($path, '/portal/session/feed')
            || str_contains($path, '/portal/session/idle-event')
            || str_contains($path, '/portal/session/timeout-logout');

        $timeoutSeconds = (int) config('session.inactivity_timeout', self::DEFAULT_IDLE_TIMEOUT);
        $now = time();
        $lastActivity = (int) $request->session()->get('security.last_activity_at', 0);

        // Enforce server-side inactivity timeout if idle window exceeded
        if ($lastActivity > 0 && ($now - $lastActivity) > $timeoutSeconds && ! str_contains($path, '/logout')) {
            $idleDuration = $now - $lastActivity;

            SessionActivity::record(
                'inactivity_logout',
                "Auto-logged out after " . round($idleDuration / 60, 1) . " min of inactivity",
                $request,
                $user,
                'expired',
                $idleDuration,
                ['reason' => 'server_inactivity_timeout']
            );

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($request->expectsJson() && ! $request->header('X-Inertia')) {
                return response()->json([
                    'message' => 'Session expired due to inactivity.',
                    'expired' => true,
                ], 401);
            }

            $baseUrl = rtrim(url('/'), '/');
            $loginUrl = ($request->is('fieldy/*') && ! str_ends_with($baseUrl, '/fieldy'))
                ? $baseUrl . '/fieldy/admin/login'
                : $baseUrl . '/admin/login';

            return redirect($loginUrl)
                ->with('session_notice', 'Your session expired due to inactivity. Please log in again.');
        }

        // Initialize session metadata if not set yet
        if (! $request->session()->has('security.login_at')) {
            $request->session()->put('security.login_at', now()->toIso8601String());
        }

        // Update activity timestamp on real user interactions (not passive polling endpoints)
        if (! $isPassiveEndpoint) {
            $request->session()->put('security.last_activity_at', $now);
            $request->session()->put('security.last_ip', $request->ip());
            $count = (int) $request->session()->get('security.actions_count', 0) + 1;
            $request->session()->put('security.actions_count', $count);

            // Log page navigation / write actions cleanly (throttled per path every 45s to keep feed crisp)
            $isWrite = in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true);
            $isPortalPage = $request->isMethod('GET')
                && (str_contains($path, '/admin/') || str_contains($path, '/superadmin/'))
                && ! str_contains($path, '/search')
                && ! str_contains($path, '/portal/session/');

            if ($isWrite && ! str_contains($path, '/portal/session/') && ! str_contains($path, '/onboarding-tour/')) {
                SessionActivity::record(
                    'page_activity',
                    $this->describeAction($request->method(), $path),
                    $request,
                    $user,
                    'active',
                    0,
                    ['method' => $request->method()]
                );
            } elseif ($isPortalPage) {
                $lastLoggedPath = $request->session()->get('security.last_logged_path');
                $lastLoggedAt = (int) $request->session()->get('security.last_logged_at', 0);

                if ($lastLoggedPath !== $path || ($now - $lastLoggedAt) >= 45) {
                    $request->session()->put('security.last_logged_path', $path);
                    $request->session()->put('security.last_logged_at', $now);

                    SessionActivity::record(
                        'page_activity',
                        $this->describePage($path),
                        $request,
                        $user,
                        'active',
                        0,
                        ['method' => 'GET']
                    );
                }
            }
        }

        return $next($request);
    }

    private function describePage(string $path): string
    {
        $clean = preg_replace('#^/fieldy#', '', $path) ?? $path;

        return match (true) {
            str_starts_with($clean, '/superadmin/dashboard') => 'Opened Superadmin Platform Overview',
            str_starts_with($clean, '/superadmin/companies') => 'Viewed Client Companies Registry',
            str_starts_with($clean, '/superadmin/employees') => 'Viewed Cross-Company Workforce',
            str_starts_with($clean, '/superadmin/analytics') => 'Viewed Platform Analytics',
            str_starts_with($clean, '/superadmin/subscriptions') => 'Viewed Subscriptions & Plans',
            str_starts_with($clean, '/admin/dashboard') => 'Opened Admin Dashboard',
            str_starts_with($clean, '/admin/employees') => 'Opened Staff Directory',
            str_starts_with($clean, '/admin/farmers') => 'Opened Project Sites Directory',
            str_starts_with($clean, '/admin/tasks') => 'Opened Task Management',
            str_starts_with($clean, '/admin/monitor') => 'Opened Live GPS Monitor',
            str_starts_with($clean, '/admin/visits') => 'Opened Site Visits & Reports',
            str_starts_with($clean, '/admin/alerts') => 'Opened Operational Alerts',
            str_starts_with($clean, '/admin/performance') => 'Opened Employee Performance',
            str_starts_with($clean, '/admin/payments') => 'Opened Payments Ledger',
            default => 'Accessed ' . $clean,
        };
    }

    private function describeAction(string $method, string $path): string
    {
        $clean = preg_replace('#^/fieldy#', '', $path) ?? $path;
        $verb = match ($method) {
            'POST' => 'Created / Submitted',
            'PUT', 'PATCH' => 'Updated',
            'DELETE' => 'Deleted',
            default => $method,
        };

        return "{$verb} record on {$clean}";
    }
}
