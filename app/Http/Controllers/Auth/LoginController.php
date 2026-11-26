<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SessionActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function index(Request $request)
    {
        // Redirect already-authenticated users
        if (Auth::check()) {
            if (Auth::user()->role === 'superadmin') {
                return redirect($this->withLocalBasePath($request, '/superadmin/dashboard'));
            }
            if (Auth::user()->role === 'admin') {
                return redirect($this->withLocalBasePath($request, '/admin/dashboard'));
            }
        }

        $reason = $request->query('reason');
        $notice = $request->session()->get('session_notice');
        if (! $notice && $reason === 'inactivity') {
            $notice = 'Your session expired due to inactivity. Please log in again.';
        }

        return Inertia::render('Auth/Login', [
            'sessionNotice' => $notice,
        ]);
    }

    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email|max:255',
            'password' => 'required|string|max:255',
        ]);

        $throttleKey = 'portal-login:' . Str::lower(trim($credentials['email'])) . '|' . $request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            SessionActivity::record(
                'login_failed',
                'Rate-limited login attempt blocked (' . Str::lower($credentials['email']) . ')',
                $request,
                null,
                'blocked',
                0,
                ['email' => Str::lower($credentials['email']), 'retry_after' => $seconds]
            );

            return back()->withErrors([
                'email' => "Too many failed login attempts. Please wait {$seconds} seconds before trying again.",
            ]);
        }

        $remember = $request->boolean('remember');
        $email = Str::lower($credentials['email']);
        $authenticated = Auth::attempt($credentials, $remember);
        if (! $authenticated && $email !== $credentials['email']) {
            $authenticated = Auth::attempt(['email' => $email, 'password' => $credentials['password']], $remember);
        }

        if (! $authenticated) {
            RateLimiter::hit($throttleKey, 900);
            SessionActivity::record('login_failed', 'Invalid credentials for '.$email, $request, null, 'blocked', 0, ['email' => $email]);

            return back()->withErrors(['email' => 'Invalid credentials. Please try again.']);
        }

        if (! in_array(Auth::user()->role, ['admin', 'superadmin'])) {
            Auth::logout();
            RateLimiter::hit($throttleKey, 900);
            SessionActivity::record('login_failed', 'Unauthorized role blocked on portal login', $request, null, 'blocked', 0, ['email' => Str::lower($credentials['email'])]);

            return back()->withErrors(['email' => 'Access denied. Administrator privileges required.']);
        }

        RateLimiter::clear($throttleKey);
        $request->session()->regenerate();
        $request->session()->put('security.login_at', now()->toIso8601String());
        $request->session()->put('security.last_activity_at', time());
        $request->session()->put('security.last_ip', $request->ip());
        $request->session()->put('security.actions_count', 1);

        $loggedUser = Auth::user();
        SessionActivity::record(
            'login',
            ($loggedUser->role === 'superadmin' ? 'Superadmin' : 'Client Admin') . ' signed into portal',
            $request,
            $loggedUser,
            'active',
            0,
            ['email' => $loggedUser->email]
        );

        if ($loggedUser->role === 'superadmin') {
            return redirect($this->withLocalBasePath($request, '/superadmin/dashboard'));
        }

        return redirect($this->withLocalBasePath($request, '/admin/dashboard'));
    }

    public function destroy(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            SessionActivity::record(
                'logout',
                ($user->role === 'superadmin' ? 'Superadmin' : 'Client Admin') . ' signed out safely',
                $request,
                $user,
                'info'
            );
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect($this->withLocalBasePath($request, '/admin/login'));
    }

    private function withLocalBasePath(Request $request, string $path): string
    {
        if (str_ends_with(rtrim(url('/'), '/'), '/fieldy')) {
            return $path;
        }

        return $request->is('fieldy/*') ? '/fieldy' . $path : $path;
    }
}
