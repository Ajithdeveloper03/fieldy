<?php

namespace App\Http\Controllers;

use App\Models\FarmerVisit;
use App\Models\MediaFile;
use App\Support\SqlSafe;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class MediaFileController extends Controller
{
    private const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];
    private const VIDEO_EXTS = ['mp4', 'mov', 'webm', 'm4v', 'avi', '3gp', 'mkv'];
    private const DOC_EXTS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'zip'];
    private const BLOCKED_MIMES = [
        'text/x-php',
        'application/x-php',
        'application/x-httpd-php',
        'text/html',
        'application/xhtml+xml',
        'image/svg+xml',
        'application/javascript',
        'text/javascript',
        'application/x-executable',
        'application/x-dosexec',
        'application/x-sh',
    ];
    private const MAX_BYTES = 52428800; // 50 MB

    /**
     * List uploaded images, videos, and documents (strictly tenant-isolated).
     */
    public function index(Request $request)
    {
        if (! MediaFile::tableReady()) {
            return response()->json(['status' => 'success', 'files' => []]);
        }

        $user = $request->user();
        $isApi = $request->is('api/*') || $request->is('fieldy/api/*');
        $companyId = $user?->company_id;
        $isSuperadmin = $user?->role === 'superadmin';

        $query = MediaFile::with('uploader:id,name')->orderByDesc('id');

        if (! $isSuperadmin) {
            if ($companyId) {
                $query->where('company_id', $companyId);
            } elseif ($user) {
                $query->where('uploaded_by', $user->id);
            }
        }

        if ($request->filled('visit_id') && is_numeric($request->input('visit_id'))) {
            $query->where('visit_id', (int) $request->input('visit_id'));
        }
        if ($request->filled('task_id') && is_numeric($request->input('task_id'))) {
            $query->where('task_id', (int) $request->input('task_id'));
        }
        if ($request->filled('farmer_id') && is_numeric($request->input('farmer_id'))) {
            $query->where('farmer_id', (int) $request->input('farmer_id'));
        }
        if (in_array($request->input('category'), ['image', 'video', 'document'], true)) {
            $query->where('category', $request->input('category'));
        }
        if ($request->filled('search')) {
            $like = SqlSafe::likeTerm((string) $request->input('search'));
            if ($like !== '') {
                $query->where(function ($sub) use ($like) {
                    $sub->where('title', 'like', $like)
                        ->orWhere('original_name', 'like', $like);
                });
            }
        }

        $files = $query->limit(100)->get()
            ->map(fn (MediaFile $file) => $file->toPayload($isApi))
            ->values();

        return response()->json([
            'status' => 'success',
            'files' => $files,
        ]);
    }

    /**
     * Upload single or multiple images, videos, or documents (supports both Web & Mobile).
     */
    public function upload(Request $request)
    {
        if (! MediaFile::tableReady()) {
            return response()->json([
                'message' => 'Media storage table is not migrated yet. Please run database migrations.',
            ], 503);
        }

        $request->validate([
            'file' => 'nullable|file|max:51200',
            'files' => 'nullable|array|max:10',
            'files.*' => 'file|max:51200',
            'title' => 'nullable|string|max:190',
            'category' => 'nullable|in:image,video,document',
            'visit_id' => 'nullable|integer|exists:farmer_visits,id',
            'task_id' => 'nullable|integer|exists:tasks,id',
            'farmer_id' => 'nullable|integer|exists:users,id',
            'captured_latitude' => 'nullable|numeric',
            'captured_longitude' => 'nullable|numeric',
        ]);

        /** @var UploadedFile[] $uploadedFiles */
        $uploadedFiles = [];
        if ($request->hasFile('file')) {
            $uploadedFiles[] = $request->file('file');
        }
        if ($request->hasFile('files')) {
            foreach ((array) $request->file('files') as $item) {
                if ($item instanceof UploadedFile) {
                    $uploadedFiles[] = $item;
                }
            }
        }

        if (empty($uploadedFiles)) {
            return response()->json(['message' => 'Please select at least one image, video, or file to upload.'], 422);
        }

        $allowedExts = array_merge(self::IMAGE_EXTS, self::VIDEO_EXTS, self::DOC_EXTS);
        foreach ($uploadedFiles as $candidate) {
            $ext = strtolower($candidate->getClientOriginalExtension());
            $size = (int) ($candidate->getSize() ?: 0);
            $realPath = $candidate->getRealPath() ?: $candidate->getPathname();
            $detectedMime = ($realPath && is_file($realPath)) ? (string) (@mime_content_type($realPath) ?: '') : '';
            $clientMime = strtolower((string) ($candidate->getClientMimeType() ?: ''));

            if ($ext === '' || ! in_array($ext, $allowedExts, true)) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'file' => ["Unsupported file type (.{$ext}). Allowed: images, videos (MP4/MOV/WebM), and documents (PDF/DOCX/XLSX/CSV/TXT/ZIP)."],
                ]);
            }
            if ($size > self::MAX_BYTES) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'file' => ['File exceeds the 50MB maximum upload limit.'],
                ]);
            }
            if (in_array(strtolower($detectedMime), self::BLOCKED_MIMES, true) || in_array($clientMime, self::BLOCKED_MIMES, true)) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'file' => ['Upload rejected for security reasons (executable or script content detected).'],
                ]);
            }
            // Reject PHP tag polyglot payloads disguised with image/doc extensions
            if ($realPath && is_file($realPath)) {
                $head = @file_get_contents($realPath, false, null, 0, 256);
                if (is_string($head) && preg_match('/<\?(?:php|=)/i', $head) === 1) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'file' => ['Upload rejected for security reasons (script tag detected inside file).'],
                    ]);
                }
            }
        }

        $user = $request->user();
        $isApi = $request->is('api/*') || $request->is('fieldy/api/*');
        $companyId = $user?->company_id;
        $folder = 'uploads/' . ($companyId ? "c{$companyId}" : 'platform') . '/' . now()->format('Y/m');
        $visitId = $request->filled('visit_id') ? (int) $request->input('visit_id') : null;
        $taskId = $request->filled('task_id') ? (int) $request->input('task_id') : null;
        $farmerId = $request->filled('farmer_id') ? (int) $request->input('farmer_id') : null;
        $customTitle = trim((string) $request->input('title', ''));

        $created = [];
        foreach ($uploadedFiles as $file) {
            $ext = strtolower($file->getClientOriginalExtension() ?: 'bin');
            $realPath = $file->getRealPath() ?: $file->getPathname();
            $detectedMime = ($realPath && is_file($realPath)) ? (string) (@mime_content_type($realPath) ?: '') : '';
            $mime = $detectedMime !== '' ? $detectedMime : (string) ($file->getClientMimeType() ?: 'application/octet-stream');
            $sizeBytes = (int) ($file->getSize() ?: ($realPath && is_file($realPath) ? @filesize($realPath) : 0));
            $originalName = $this->sanitizeFilename($file->getClientOriginalName() ?: ('file.' . $ext));
            $category = $this->detectCategory($ext, $mime, $request->input('category'));

            $safeFilename = Str::uuid()->toString() . '.' . preg_replace('/[^a-z0-9]/', '', $ext);
            $storedPath = $file->storeAs($folder, $safeFilename, 'local');

            if ($sizeBytes <= 0 && $storedPath && Storage::disk('local')->exists($storedPath)) {
                $sizeBytes = (int) Storage::disk('local')->size($storedPath);
            }

            $record = MediaFile::create([
                'company_id' => $companyId,
                'uploaded_by' => $user?->id,
                'visit_id' => $visitId,
                'task_id' => $taskId,
                'farmer_id' => $farmerId,
                'category' => $category,
                'title' => $customTitle !== '' ? $customTitle : pathinfo($originalName, PATHINFO_FILENAME),
                'original_name' => $originalName,
                'stored_path' => $storedPath,
                'mime_type' => $mime,
                'size_bytes' => $sizeBytes,
                'captured_latitude' => $request->filled('captured_latitude') ? (float) $request->input('captured_latitude') : null,
                'captured_longitude' => $request->filled('captured_longitude') ? (float) $request->input('captured_longitude') : null,
            ]);

            // Mirror image/video records to legacy visit_media table when attached to a visit
            if ($visitId && in_array($category, ['image', 'video'], true) && Schema::hasTable('visit_media')) {
                DB::table('visit_media')->insert([
                    'visit_id' => $visitId,
                    'file_path' => $storedPath,
                    'file_type' => $category === 'video' ? 'video' : 'photo',
                    'captured_latitude' => $record->captured_latitude,
                    'captured_longitude' => $record->captured_longitude,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $record->load('uploader:id,name');
            $created[] = $record->toPayload($isApi);
        }

        return response()->json([
            'status' => 'success',
            'message' => count($created) === 1 ? 'File uploaded successfully.' : count($created) . ' files uploaded successfully.',
            'file' => $created[0],
            'files' => $created,
        ], 201);
    }

    /**
     * Authenticated inline stream/preview (supports video Range requests on Hostinger & local).
     */
    public function view(Request $request, int $id)
    {
        $media = $this->findAuthorized($request, $id);

        return $this->streamFile($media, false);
    }

    /**
     * Authenticated forced download (Content-Disposition: attachment).
     */
    public function download(Request $request, int $id)
    {
        $media = $this->findAuthorized($request, $id);

        return $this->streamFile($media, true);
    }

    /**
     * Temporary signed URL inline stream (for mobile <Image>, video players & web previews).
     */
    public function signedView(Request $request, int $id)
    {
        if (! $request->hasValidSignature() && ! $request->hasValidRelativeSignature()) {
            abort(403, 'Invalid or expired media signature.');
        }

        $media = MediaFile::findOrFail($id);

        return $this->streamFile($media, false);
    }

    /**
     * Temporary signed URL download (for mobile OS browser downloads & direct downloads).
     */
    public function signedDownload(Request $request, int $id)
    {
        if (! $request->hasValidSignature() && ! $request->hasValidRelativeSignature()) {
            abort(403, 'Invalid or expired download link.');
        }

        $media = MediaFile::findOrFail($id);

        return $this->streamFile($media, true);
    }

    /**
     * Delete an uploaded media file from disk and database.
     */
    public function destroy(Request $request, int $id)
    {
        $media = $this->findAuthorized($request, $id);

        if ($media->stored_path && Storage::disk('local')->exists($media->stored_path)) {
            Storage::disk('local')->delete($media->stored_path);
        }

        if ($media->visit_id && Schema::hasTable('visit_media')) {
            DB::table('visit_media')
                ->where('visit_id', $media->visit_id)
                ->where('file_path', $media->stored_path)
                ->delete();
        }

        $media->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'File deleted successfully.',
        ]);
    }

    /**
     * Download a self-contained Visit Report Dossier file via signed URL (for Mobile OS browser).
     */
    public function signedVisitDossier(Request $request, int $id)
    {
        if (! $request->hasValidSignature() && ! $request->hasValidRelativeSignature()) {
            abort(403, 'Invalid or expired report download link.');
        }

        $visit = FarmerVisit::with(['employee:id,name', 'farmer:id,name'])->findOrFail($id);

        return $this->buildVisitDossierResponse($visit);
    }

    /**
     * Download a self-contained Visit Report Dossier file (HTML) from Web or Mobile.
     */
    public function downloadVisitDossier(Request $request, int $id)
    {
        $user = $request->user();
        $isSuperadmin = $user?->role === 'superadmin';
        $companyId = $user?->company_id;

        $visitQuery = FarmerVisit::with(['employee:id,name', 'farmer:id,name']);
        if (! $isSuperadmin && $companyId) {
            $visitQuery->whereHas('employee', fn ($e) => $e->where('company_id', $companyId));
        } elseif ($user && $user->role === 'employee') {
            $visitQuery->where('employee_id', $user->id);
        }

        $visit = $visitQuery->findOrFail($id);

        return $this->buildVisitDossierResponse($visit);
    }

    private function buildVisitDossierResponse(FarmerVisit $visit)
    {

        $mediaItems = MediaFile::tableReady()
            ? MediaFile::where('visit_id', $visit->id)->orderByDesc('id')->get()
            : collect();

        $siteName = e($visit->farmer?->name ?? 'Project Site');
        $staffName = e($visit->employee?->name ?? 'Field Officer');
        $dateStr = e($visit->created_at?->format('M d, Y h:i A') ?? now()->format('M d, Y'));
        $notes = nl2br(e($visit->farm_condition_notes ?: 'No field notes recorded.'));
        $recs = nl2br(e($visit->recommendations ?: 'No follow-up recommendations recorded.'));
        $gps = ($visit->check_in_latitude && $visit->check_in_longitude)
            ? "{$visit->check_in_latitude}, {$visit->check_in_longitude}"
            : 'N/A';

        $mediaHtml = '';
        if ($mediaItems->isEmpty()) {
            $mediaHtml = '<p style="color:#64748b">No images, videos, or documents attached to this visit.</p>';
        } else {
            $mediaHtml .= '<ul>';
            foreach ($mediaItems as $m) {
                $link = URL::temporarySignedRoute('media.signed.download', now()->addDays(7), ['id' => $m->id]);
                $mediaHtml .= '<li><strong>' . e(strtoupper($m->category)) . '</strong>: '
                    . e($m->title ?: $m->original_name)
                    . ' (' . e($m->humanSize()) . ') — <a href="' . e($link) . '">Download File</a></li>';
            }
            $mediaHtml .= '</ul>';
        }

        $html = "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">"
            . "<title>Fieldy Visit Report #{$visit->id}</title>"
            . "<style>body{font-family:system-ui,-apple-system,sans-serif;max-width:820px;margin:32px auto;padding:0 20px;color:#0f172a;line-height:1.6}"
            . ".card{border:1px solid #e2e8f0;border-radius:12px;padding:18px 22px;margin-bottom:16px}"
            . "h1{margin:0 0 6px;font-size:24px}h2{margin:0 0 10px;font-size:16px;color:#0f766e}"
            . ".meta{color:#475569;font-size:14px}</style></head><body>"
            . "<div class=\"card\"><h1>Fieldy Visit Dossier #{$visit->id}</h1>"
            . "<div class=\"meta\"><strong>Site:</strong> {$siteName} &nbsp;|&nbsp; <strong>Staff:</strong> {$staffName}<br>"
            . "<strong>Date:</strong> {$dateStr} &nbsp;|&nbsp; <strong>GPS:</strong> {$gps}</div></div>"
            . "<div class=\"card\"><h2>Field Notes</h2><div>{$notes}</div></div>"
            . "<div class=\"card\"><h2>Recommendations</h2><div>{$recs}</div></div>"
            . "<div class=\"card\"><h2>Attached Media & Files ({$mediaItems->count()})</h2>{$mediaHtml}</div>"
            . "</body></html>";

        $filename = "fieldy-visit-report-{$visit->id}.html";

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function findAuthorized(Request $request, int $id): MediaFile
    {
        $media = MediaFile::findOrFail($id);
        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        if ($user->role === 'superadmin') {
            return $media;
        }

        if ($user->company_id && $media->company_id && (int) $user->company_id === (int) $media->company_id) {
            return $media;
        }

        if ((int) $media->uploaded_by === (int) $user->id) {
            return $media;
        }

        abort(403, 'You do not have permission to access this file.');
    }

    private function streamFile(MediaFile $media, bool $asAttachment)
    {
        if (! $media->stored_path || ! Storage::disk('local')->exists($media->stored_path)) {
            abort(404, 'File not found on storage.');
        }

        $absPath = Storage::disk('local')->path($media->stored_path);
        if (! is_file($absPath)) {
            abort(404, 'File not found on storage.');
        }

        $safeName = $this->sanitizeFilename($media->original_name ?: basename($absPath));
        $mime = $media->mime_type ?: (@mime_content_type($absPath) ?: 'application/octet-stream');
        $fileSize = (int) (@filesize($absPath) ?: $media->size_bytes ?: 0);

        $disposition = $asAttachment
            ? "attachment; filename=\"{$safeName}\""
            : "inline; filename=\"{$safeName}\"";

        $start = 0;
        $end = max(0, $fileSize - 1);
        $status = 200;
        $rangeHeader = request()->header('Range');

        if (! $asAttachment && $fileSize > 0 && is_string($rangeHeader) && preg_match('/bytes=(\d*)-(\d*)/i', $rangeHeader, $m)) {
            $reqStart = $m[1] !== '' ? (int) $m[1] : 0;
            $reqEnd = $m[2] !== '' ? (int) $m[2] : $end;
            if ($reqStart <= $reqEnd && $reqStart < $fileSize) {
                $start = $reqStart;
                $end = min($reqEnd, $fileSize - 1);
                $status = 206;
            }
        }

        $length = $fileSize > 0 ? ($end - $start + 1) : 0;
        $headers = [
            'Content-Type' => $mime,
            'Content-Disposition' => $disposition,
            'Content-Length' => (string) $length,
            'X-Content-Type-Options' => 'nosniff',
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'private, max-age=3600',
        ];
        if ($status === 206) {
            $headers['Content-Range'] = "bytes {$start}-{$end}/{$fileSize}";
        }

        return response()->stream(function () use ($absPath, $start, $length) {
            $handle = @fopen($absPath, 'rb');
            if ($handle === false) {
                return;
            }
            if ($start > 0) {
                fseek($handle, $start);
            }
            $remaining = $length;
            while ($remaining > 0 && ! feof($handle)) {
                $chunk = fread($handle, min(65536, $remaining));
                if ($chunk === false || $chunk === '') {
                    break;
                }
                echo $chunk;
                $remaining -= strlen($chunk);
            }
            fclose($handle);
        }, $status, $headers);
    }

    private function detectCategory(string $ext, string $mime, ?string $requested): string
    {
        if (in_array($ext, self::VIDEO_EXTS, true) || str_starts_with($mime, 'video/')) {
            return 'video';
        }
        if (in_array($ext, self::IMAGE_EXTS, true) || str_starts_with($mime, 'image/')) {
            return 'image';
        }
        if ($requested && in_array($requested, ['image', 'video', 'document'], true)) {
            return $requested;
        }

        return 'document';
    }

    private function sanitizeFilename(string $name): string
    {
        $base = basename(str_replace('\\', '/', $name));
        $clean = preg_replace('/[^A-Za-z0-9._\-\s]/', '_', $base) ?? 'file';
        $clean = trim($clean, " .");

        return $clean !== '' ? mb_substr($clean, 0, 180) : 'fieldy-file';
    }
}
