<?php

namespace App\Http\Middleware;

use App\Models\SessionActivity;
use App\Support\SqlSafe;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SqlInjectionGuard
{
    /**
     * Inspect incoming query, route, and form parameters for SQL injection payloads,
     * reject malicious requests before controllers execute, and attach security headers.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $violation = $this->scanArray($request->query(), 'query')
            ?? $this->scanArray($request->post(), 'body')
            ?? ($request->isJson() ? $this->scanArray($request->json()->all(), 'json') : null)
            ?? $this->scanRouteParams($request);

        if ($violation !== null) {
            Log::warning('SQL injection attempt blocked', [
                'rule' => $violation['rule'],
                'field' => $violation['field'],
                'ip' => $request->ip(),
                'path' => $request->path(),
                'user_id' => $request->user()?->id,
            ]);

            SessionActivity::record(
                'sql_injection_blocked',
                "Blocked SQLi attempt ({$violation['rule']}) on {$violation['field']}",
                $request,
                $request->user(),
                'blocked',
                0,
                [
                    'rule' => $violation['rule'],
                    'field' => $violation['field'],
                ]
            );

            if ($request->expectsJson() || $request->is('api/*') || $request->is('fieldy/api/*')) {
                return response()->json([
                    'message' => 'Request rejected by Fieldy SQL Injection Protection.',
                    'code' => 'SQLI_BLOCKED',
                ], 403);
            }

            if ($request->header('X-Inertia')) {
                $msg = 'Security shield blocked an unsafe SQL input pattern.';
                $redirect = back()->with('error', $msg);
                if (str_contains($request->path(), 'login')) {
                    $redirect->withErrors(['email' => $msg]);
                }

                return $redirect;
            }

            abort(403, 'Request rejected by Fieldy SQL Injection Protection.');
        }

        $response = $next($request);

        // Attach defense-in-depth HTTP security headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        return $response;
    }

    private function scanRouteParams(Request $request): ?array
    {
        $route = $request->route();
        if (! $route) {
            return null;
        }

        return $this->scanArray($route->parameters(), 'route');
    }

    private function scanArray(array $data, string $prefix, int $depth = 0): ?array
    {
        if ($depth > 6) {
            return null;
        }

        foreach ($data as $key => $value) {
            $keyStr = (string) $key;
            $fieldPath = "{$prefix}.{$keyStr}";

            // Skip CSRF token and binary uploaded files
            if ($keyStr === '_token' || $value instanceof \Illuminate\Http\UploadedFile) {
                continue;
            }

            // Inspect parameter name itself too
            if ($rule = SqlSafe::detectSqlInjection($keyStr)) {
                return ['rule' => $rule, 'field' => $fieldPath];
            }

            if (is_array($value)) {
                $nested = $this->scanArray($value, $fieldPath, $depth + 1);
                if ($nested !== null) {
                    return $nested;
                }
                continue;
            }

            if (is_string($value) && $value !== '') {
                $rule = SqlSafe::detectSqlInjection($value);
                if ($rule !== null) {
                    return ['rule' => $rule, 'field' => $fieldPath];
                }
            }
        }

        return null;
    }
}
