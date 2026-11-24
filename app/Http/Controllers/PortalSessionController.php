<?php

namespace App\Http\Controllers;

use App\Http\Middleware\TrackSessionActivity;
use App\Models\SessionActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PortalSessionController extends Controller
{
    /**
     * Extend / refresh active session heartbeat (resets server inactivity clock).
     */
    public function heartbeat(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['expired' => true], 401);
        }

        $now = time();
        $wasExtendedFromWarning = $request->boolean('extended', false);
        $idleSeconds = max(0, (int) $request->input('idle_seconds', 0));

        $request->session()->put('security.last_activity_at', $now);
        if (! $request->session()->has('security.login_at')) {
            $request->session()->put('security.login_at', now()->toIso8601String());
        }

        if ($wasExtendedFromWarning) {
            SessionActivity::record(
                'session_extended',
                'Admin confirmed active presence & extended session',
                $request,
                $user,
                'active',
                $idleSeconds
            );
        }

        $timeoutSeconds = (int) config('session.inactivity_timeout', TrackSessionActivity::DEFAULT_IDLE_TIMEOUT);

        return response()->json([
            'ok' => true,
            'lastActivityAt' => $now,
            'timeoutSeconds' => $timeoutSeconds,
            'remainingSeconds' => $timeoutSeconds,
        ]);
    }

    /**
     * Record client-detected idle / resume transitions for live inactivity auditing.
     */
    public function idleEvent(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['expired' => true], 401);
        }

        $state = $request->input('state') === 'resumed' ? 'resumed' : 'idle';
        $idleSeconds = max(0, min(86400, (int) $request->input('idle_seconds', 0)));

        if ($state === 'idle') {
            SessionActivity::record(
                'inactivity_detected',
                'Session marked idle after ' . max(1, (int) round($idleSeconds / 60)) . ' min without activity',
                $request,
                $user,
                'idle',
                $idleSeconds
            );
        } else {
            $request->session()->put('security.last_activity_at', time());
            SessionActivity::record(
                'activity_resumed',
                'Resumed active session after ' . $idleSeconds . 's idle',
                $request,
                $user,
                'active',
                $idleSeconds
            );
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Triggered when client idle countdown reaches 0 — cleanly invalidates session & logs event.
     */
    public function timeoutLogout(Request $request)
    {
        $user = $request->user();
        $idleSeconds = max(0, (int) $request->input('idle_seconds', TrackSessionActivity::DEFAULT_IDLE_TIMEOUT));

        if ($user) {
            SessionActivity::record(
                'inactivity_logout',
                'Auto-logged out after inactivity timeout',
                $request,
                $user,
                'expired',
                $idleSeconds,
                ['reason' => 'client_idle_countdown']
            );
        }

        Auth::logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        $baseUrl = rtrim(url('/'), '/');
        $loginUrl = ($request->is('fieldy/*') && ! str_ends_with($baseUrl, '/fieldy'))
            ? $baseUrl . '/fieldy/admin/login'
            : $baseUrl . '/admin/login';

        if ($request->expectsJson() && ! $request->header('X-Inertia')) {
            return response()->json([
                'ok' => true,
                'redirect' => $loginUrl . '?reason=inactivity',
            ]);
        }

        return redirect($loginUrl . '?reason=inactivity')
            ->with('session_notice', 'You were automatically logged out due to inactivity.');
    }

    /**
     * Fetch live session activity, inactivity & login audit feed (tenant-isolated for Admins, platform-wide for Superadmins).
     */
    public function feed(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['expired' => true], 401);
        }

        $isSuperadmin = $user->role === 'superadmin';
        $companyId = $user->company_id;
        $timeoutSeconds = (int) config('session.inactivity_timeout', TrackSessionActivity::DEFAULT_IDLE_TIMEOUT);
        $lastActivityAt = (int) $request->session()->get('security.last_activity_at', time());
        $remainingSeconds = max(0, $timeoutSeconds - (time() - $lastActivityAt));

        if (! SessionActivity::tableReady()) {
            return response()->json([
                'events' => [],
                'summary' => [
                    'loginsToday' => 1,
                    'activeEventsToday' => 1,
                    'inactivityEventsToday' => 0,
                    'blockedSqliCount' => 0,
                    'remainingSeconds' => $remainingSeconds,
                    'timeoutSeconds' => $timeoutSeconds,
                    'loginAt' => $request->session()->get('security.login_at', now()->toIso8601String()),
                    'ipAddress' => $request->ip(),
                ],
            ]);
        }

        $baseQuery = SessionActivity::query()->with('user:id,name,email,role');

        if (! $isSuperadmin) {
            if ($companyId) {
                $baseQuery->where('company_id', $companyId);
            } else {
                $baseQuery->where('user_id', $user->id);
            }
        }

        $today = now()->startOfDay();

        $events = (clone $baseQuery)
            ->orderByDesc('id')
            ->limit(25)
            ->get()
            ->map(fn (SessionActivity $e) => [
                'id' => $e->id,
                'event_type' => $e->event_type,
                'label' => $e->label,
                'status' => $e->status,
                'route_path' => $e->route_path,
                'ip_address' => $e->ip_address,
                'idle_seconds' => $e->idle_seconds,
                'user_name' => $e->user?->name ?? ($e->meta['email'] ?? 'Guest'),
                'user_role' => $e->role ?? $e->user?->role ?? 'user',
                'time_ago' => $e->created_at?->diffForHumans() ?? 'Just now',
                'timestamp' => $e->created_at?->format('M d, h:i A') ?? now()->format('M d, h:i A'),
            ])
            ->values();

        $summary = [
            'loginsToday' => (clone $baseQuery)->whereIn('event_type', ['login', 'impersonate'])->where('created_at', '>=', $today)->count(),
            'failedLoginsToday' => (clone $baseQuery)->where('event_type', 'login_failed')->where('created_at', '>=', $today)->count(),
            'activeEventsToday' => (clone $baseQuery)->whereIn('event_type', ['page_activity', 'activity_resumed', 'session_extended'])->where('created_at', '>=', $today)->count(),
            'inactivityEventsToday' => (clone $baseQuery)->whereIn('event_type', ['inactivity_detected', 'inactivity_logout'])->where('created_at', '>=', $today)->count(),
            'blockedSqliCount' => (clone $baseQuery)->where('event_type', 'sql_injection_blocked')->count(),
            'remainingSeconds' => $remainingSeconds,
            'timeoutSeconds' => $timeoutSeconds,
            'loginAt' => $request->session()->get('security.login_at', now()->toIso8601String()),
            'ipAddress' => $request->ip(),
        ];

        return response()->json([
            'events' => $events,
            'summary' => $summary,
        ]);
    }
}
