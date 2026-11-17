<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class DemoAuthMiddleware
{
    /**
     * Authenticate mobile API requests via Sanctum Bearer token first,
     * with phone-header fallback for demo sessions.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = null;

        if ($bearer = $request->bearerToken()) {
            $accessToken = PersonalAccessToken::findToken($bearer);
            if ($accessToken && $accessToken->tokenable instanceof User) {
                $user = $accessToken->tokenable;
            }
        }

        if (! $user && ($phone = $request->header('X-Demo-Phone') ?? $request->header('X-User-Phone'))) {
            $user = User::where('phone', $phone)->first();
        }

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated. Please sign in again.',
            ], 401);
        }

        $user->loadMissing('company');

        if ($user->status === 'disabled' || in_array($user->company?->status, ['inactive', 'disabled'], true)) {
            return response()->json([
                'message' => 'Your account or company has been deactivated.',
            ], 403);
        }

        auth()->login($user);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
