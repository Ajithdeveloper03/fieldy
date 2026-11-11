<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    /**
     * Handle an incoming request.
     * Redirect non-authenticated or non-admin users to the login page.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            $loginUrl = $request->is('fieldy/*') ? '/fieldy/admin/login' : route('login');

            return redirect($loginUrl)->with('error', 'Please log in to access the admin panel.');
        }

        if (! in_array(Auth::user()->role, ['admin', 'superadmin'])) {
            Auth::logout();

            $loginUrl = $request->is('fieldy/*') ? '/fieldy/admin/login' : route('login');

            return redirect($loginUrl)->with('error', 'Access denied. Admin privileges required.');
        }

        return $next($request);
    }
}
