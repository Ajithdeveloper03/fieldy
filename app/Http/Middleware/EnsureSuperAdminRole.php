<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdminRole
{
    /**
     * Handle an incoming request.
     * Redirect non-authenticated or non-superadmin users to the superadmin login page.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return redirect()->route('superadmin.login')->with('error', 'Please log in to access the Superadmin panel.');
        }

        if (Auth::user()->role !== 'superadmin') {
            Auth::logout();

            return redirect()->route('superadmin.login')->with('error', 'Access denied. Superadmin privileges required.');
        }

        return $next($request);
    }
}
