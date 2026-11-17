<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Auto-configure subfolder base URL and HTTPS (e.g. for /fieldy hosting)
        $appUrl = config('app.url');
        $requestUri = $_SERVER['REQUEST_URI'] ?? '';
        if ($requestUri === '/fieldy' || str_starts_with($requestUri, '/fieldy/') || str_starts_with($requestUri, '/fieldy?')) {
            $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
                       (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
            $scheme = $isHttps ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            URL::forceRootUrl("{$scheme}://{$host}/fieldy");
            if ($isHttps) {
                URL::forceScheme('https');
            }
        } elseif (!empty($appUrl) && $appUrl !== 'http://localhost') {
            URL::forceRootUrl($appUrl);
            if (str_starts_with($appUrl, 'https://')) {
                URL::forceScheme('https');
            }
        }
    }
}
