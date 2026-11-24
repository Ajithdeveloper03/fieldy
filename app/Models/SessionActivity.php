<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class SessionActivity extends Model
{
    protected $fillable = [
        'user_id',
        'company_id',
        'session_id',
        'role',
        'event_type',
        'label',
        'route_path',
        'ip_address',
        'user_agent',
        'status',
        'idle_seconds',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
        'idle_seconds' => 'integer',
    ];

    private static ?bool $tableAvailable = null;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public static function tableReady(): bool
    {
        if (self::$tableAvailable === null) {
            try {
                self::$tableAvailable = Schema::hasTable('session_activities');
            } catch (\Throwable $e) {
                self::$tableAvailable = false;
            }
        }

        return self::$tableAvailable;
    }

    /**
     * Safely record a session / login / inactivity / security event without ever breaking user requests.
     */
    public static function record(
        string $eventType,
        string $label,
        ?Request $request = null,
        ?User $user = null,
        string $status = 'active',
        int $idleSeconds = 0,
        array $meta = []
    ): ?self {
        if (! self::tableReady()) {
            return null;
        }

        $req = $request ?? request();
        $actor = $user ?? $req?->user();

        try {
            return self::create([
                'user_id' => $actor?->id,
                'company_id' => $actor?->company_id,
                'session_id' => $req && $req->hasSession() ? substr((string) $req->session()->getId(), 0, 120) : null,
                'role' => $actor?->role,
                'event_type' => substr($eventType, 0, 48),
                'label' => substr($label, 0, 190),
                'route_path' => $req ? substr('/' . ltrim((string) $req->path(), '/'), 0, 255) : null,
                'ip_address' => $req?->ip(),
                'user_agent' => $req ? substr((string) $req->userAgent(), 0, 255) : null,
                'status' => substr($status, 0, 32),
                'idle_seconds' => max(0, $idleSeconds),
                'meta' => empty($meta) ? null : $meta,
            ]);
        } catch (\Throwable $e) {
            return null;
        }
    }
}
