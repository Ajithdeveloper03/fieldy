<?php

namespace App\Services\Industry;

use App\Models\Company;
use App\Services\IndustryService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema;

/**
 * Resolves and persists the active service vertical ("industry") for the admin panel,
 * and scopes database queries so that every page only shows that vertical's records.
 *
 * Resolution order: ?industry= query param (persisted to session) → session → company default → real_estate.
 */
class IndustryContext
{
    public const SESSION_KEY = 'fieldy.industry';
    public const DEFAULT = 'real_estate';

    /**
     * Legacy values stored in older rows. 'facility_management' is the old DB column default on
     * `tasks` (i.e. "not set"), so those rows belong to the default vertical. New rows always store
     * a normalized key such as 'facility_fmcg'.
     */
    private const LEGACY = [
        'facility_management' => 'real_estate',
    ];

    private static array $columnCache = [];

    public static function current(): string
    {
        $request = request();

        if ($request && $request->filled('industry')) {
            $key = IndustryService::normalize($request->query('industry', $request->input('industry')));
            if ($request->hasSession()) {
                $request->session()->put(self::SESSION_KEY, $key);
            }

            return $key;
        }

        if ($request && $request->hasSession() && $request->session()->has(self::SESSION_KEY)) {
            return IndustryService::normalize($request->session()->get(self::SESSION_KEY));
        }

        $companyId = auth()->user()?->company_id;
        if ($companyId) {
            $industry = Company::whereKey($companyId)->value('industry');
            if ($industry) {
                return IndustryService::normalize($industry);
            }
        }

        return self::DEFAULT;
    }

    public static function isDefault(?string $key = null): bool
    {
        return ($key ?? self::current()) === self::DEFAULT;
    }

    /** All raw DB values that belong to the given vertical. */
    public static function storedValues(string $key): array
    {
        $values = [$key];
        foreach (self::LEGACY as $legacy => $mapped) {
            if ($mapped === $key) {
                $values[] = $legacy;
            }
        }

        return $values;
    }

    public static function hasColumn(string $table): bool
    {
        if (! array_key_exists($table, self::$columnCache)) {
            try {
                self::$columnCache[$table] = Schema::hasColumn($table, 'industry');
            } catch (\Throwable $e) {
                self::$columnCache[$table] = false;
            }
        }

        return self::$columnCache[$table];
    }

    /**
     * Restrict a query to rows of the active vertical.
     * Rows with NULL industry belong to the default vertical (real_estate).
     * If the column does not exist yet (migration not run), non-default verticals get no DB rows
     * (pages then fall back to the vertical's sample data).
     */
    public static function scope(Builder $query, ?string $key = null, ?string $column = null): Builder
    {
        $key = $key ?? self::current();
        $table = $query->getModel()->getTable();
        $column = $column ?? $table . '.industry';

        if (! self::hasColumn($table)) {
            return self::isDefault($key) ? $query : $query->whereRaw('1 = 0');
        }

        $values = self::storedValues($key);

        return $query->where(function ($q) use ($column, $values, $key) {
            $q->whereIn($column, $values);
            if (self::isDefault($key)) {
                $q->orWhereNull($column);
            }
        });
    }

    /** Add the active vertical to attributes about to be inserted (only if the column exists). */
    public static function tag(array $attributes, string $table, ?string $key = null): array
    {
        if (self::hasColumn($table)) {
            $attributes['industry'] = $key ?? self::current();
        }

        return $attributes;
    }
}
