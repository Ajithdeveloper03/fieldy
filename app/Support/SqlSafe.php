<?php

namespace App\Support;

class SqlSafe
{
    /**
     * Escape SQL LIKE wildcard characters (%, _, \) so user search inputs
     * are strictly treated as literal text inside parameterized LIKE bindings.
     */
    public static function escapeLike(?string $value): string
    {
        if ($value === null) {
            return '';
        }

        return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value);
    }

    /**
     * Trim, strip null bytes/control characters, cap length, and escape LIKE wildcards.
     */
    public static function likeTerm(?string $value, int $maxLength = 100): string
    {
        $clean = self::cleanInput($value, $maxLength);
        if ($clean === '') {
            return '';
        }

        return '%' . self::escapeLike($clean) . '%';
    }

    /**
     * Sanitize general query/search text against null bytes and oversized payloads.
     */
    public static function cleanInput(?string $value, int $maxLength = 120): string
    {
        if ($value === null) {
            return '';
        }

        $clean = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', trim($value)) ?? '';

        return mb_substr($clean, 0, $maxLength);
    }

    /**
     * High-confidence SQL injection signature patterns (zero false positives on normal English/Tamil text).
     */
    public static function detectSqlInjection(string $value): ?string
    {
        if ($value === '' || strlen($value) < 4) {
            return null;
        }

        $decoded = rawurldecode($value);
        $target = preg_replace('/\s+/', ' ', $decoded) ?? $decoded;

        $patterns = [
            'union_select' => '/\bUNION\b\s+(?:ALL\s+)?\bSELECT\b/i',
            'stacked_query' => '/;\s*(?:DROP|ALTER|TRUNCATE|DELETE|INSERT|UPDATE|CREATE|REPLACE|EXEC|EXECUTE|SHUTDOWN)\s+/i',
            'tautology_quote' => '/[\'"]\s*(?:OR|AND)\s+[\'"]?\s*([a-z0-9_]+)\s*[\'"]?\s*=\s*[\'"]?\1[\'"]?/i',
            'tautology_comment' => '/(?:[\'"]\s*|\b)(?:OR|AND)\s+\d+\s*=\s*\d+\s*(?:--|#|\/\*)/i',
            'time_blind' => '/\b(?:SLEEP|BENCHMARK|PG_SLEEP)\s*\(|WAITFOR\s+DELAY\b/i',
            'schema_exfil' => '/\b(?:INFORMATION_SCHEMA|MYSQL\.USER|SYS\.OBJECTS|SYS\.TABLES)\b/i',
            'file_access' => '/\b(?:LOAD_FILE\s*\(|INTO\s+(?:OUT|DUMP)FILE)\b/i',
            'error_based' => '/\b(?:EXTRACTVALUE|UPDATEXML)\s*\(/i',
            'mssql_xp' => '/\bxp_cmdshell\b/i',
            'comment_bypass' => '/\/\*!\d{4,5}\s*(?:SELECT|UNION|DROP|ALTER|UPDATE|DELETE)/i',
        ];

        foreach ($patterns as $rule => $regex) {
            if (preg_match($regex, $target) === 1) {
                return $rule;
            }
        }

        return null;
    }
}
