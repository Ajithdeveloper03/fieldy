<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;

class MediaFile extends Model
{
    protected $fillable = [
        'company_id',
        'uploaded_by',
        'visit_id',
        'task_id',
        'farmer_id',
        'category',
        'title',
        'original_name',
        'stored_path',
        'mime_type',
        'size_bytes',
        'captured_latitude',
        'captured_longitude',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
        'captured_latitude' => 'float',
        'captured_longitude' => 'float',
    ];

    private static ?bool $hasTableCache = null;

    public static function tableReady(): bool
    {
        if (self::$hasTableCache !== null) {
            return self::$hasTableCache;
        }

        try {
            self::$hasTableCache = Schema::hasTable('media_files');
        } catch (\Throwable) {
            self::$hasTableCache = false;
        }

        return self::$hasTableCache;
    }

    public static function resetTableCache(): void
    {
        self::$hasTableCache = null;
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(FarmerVisit::class, 'visit_id');
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function farmer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'farmer_id');
    }

    public function humanSize(): string
    {
        $bytes = (int) $this->size_bytes;
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        }
        if ($bytes >= 1024) {
            return round($bytes / 1024, 1) . ' KB';
        }

        return $bytes . ' B';
    }

    public function toPayload(bool $signed = false): array
    {
        if ($signed) {
            $previewUrl = URL::temporarySignedRoute('media.signed.view', now()->addHours(12), ['id' => $this->id]);
            $downloadUrl = URL::temporarySignedRoute('media.signed.download', now()->addHours(12), ['id' => $this->id]);
        } else {
            $previewUrl = url("/media/{$this->id}/view");
            $downloadUrl = url("/media/{$this->id}/download");
        }

        return [
            'id' => $this->id,
            'category' => $this->category,
            'title' => $this->title ?: $this->original_name,
            'original_name' => $this->original_name,
            'mime_type' => $this->mime_type,
            'size_bytes' => (int) $this->size_bytes,
            'size_human' => $this->humanSize(),
            'visit_id' => $this->visit_id,
            'task_id' => $this->task_id,
            'farmer_id' => $this->farmer_id,
            'uploader_name' => $this->uploader?->name ?? 'Field Team',
            'captured_latitude' => $this->captured_latitude,
            'captured_longitude' => $this->captured_longitude,
            'preview_url' => $previewUrl,
            'download_url' => $downloadUrl,
            'created_at' => $this->created_at?->toIso8601String(),
            'date_label' => $this->created_at?->format('M d, Y h:i A') ?? now()->format('M d, Y h:i A'),
        ];
    }
}
