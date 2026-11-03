<?php

error_reporting(E_ALL);
ini_set('display_errors', '1');

header('Content-Type: text/html; charset=utf-8');

$publicHtmlDir = dirname(__DIR__); // /home/.../public_html
$fieldyDir = __DIR__;              // /home/.../public_html/fieldy
$backendDir = $publicHtmlDir . '/fieldy_backend';

$possibleZipPaths = [
    $publicHtmlDir . '/fieldy-fix-public_html.zip',
    $fieldyDir . '/fieldy-fix-public_html.zip',
    $fieldyDir . '/fieldy-frontend.zip',
];

$zipPath = null;
foreach ($possibleZipPaths as $p) {
    if (file_exists($p)) {
        $zipPath = $p;
        break;
    }
}

// Handle file upload directly through browser if submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['zip_file'])) {
    $uploaded = $_FILES['zip_file'];
    if ($uploaded['error'] === UPLOAD_ERR_OK) {
        $target = $publicHtmlDir . '/fieldy-fix-public_html.zip';
        if (move_uploaded_file($uploaded['tmp_name'], $target)) {
            $zipPath = $target;
            echo "<div style='background:#dcfce7;color:#166534;padding:12px;border-radius:8px;margin-bottom:16px;'>Uploaded <strong>" . htmlspecialchars($uploaded['name']) . "</strong> successfully!</div>";
        }
    }
}

$action = $_GET['action'] ?? ($_POST['action'] ?? '');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Fieldy One-Click Deployment Tool</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 30px; margin: 0; }
        .container { max-width: 800px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
        h1 { margin-top: 0; font-size: 24px; color: #f97316; display: flex; align-items: center; gap: 10px; }
        .badge { background: #334155; color: #94a3b8; padding: 4px 10px; border-radius: 999px; font-size: 12px; }
        .card { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .btn { background: #f97316; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; text-decoration: none; display: inline-block; font-size: 14px; }
        .btn:hover { background: #ea580c; }
        .btn-secondary { background: #334155; color: white; }
        .btn-secondary:hover { background: #475569; }
        pre { background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; overflow-x: auto; color: #38bdf8; font-size: 12px; line-height: 1.5; }
        .success { color: #4ade80; font-weight: bold; }
        .error { color: #f87171; font-weight: bold; }
        .info { color: #94a3b8; font-size: 13px; }
    </style>
</head>
<body>
<div class="container">
    <h1>🚀 Fieldy Auto-Deployment Hub <span class="badge">Hostinger Production</span></h1>
    <p class="info">This tool automatically extracts updates, routes Vite chunks, clears framework caches, and runs database migrations.</p>

    <div class="card">
        <h3 style="margin-top:0; color:#e2e8f0;">Environment Detection</h3>
        <table style="width:100%; font-size:13px; color:#cbd5e1; border-collapse:collapse;">
            <tr><td style="padding:6px 0; width:220px;">Frontend Directory:</td><td><code><?= htmlspecialchars($fieldyDir) ?></code></td></tr>
            <tr><td style="padding:6px 0;">Backend Directory:</td><td><code><?= htmlspecialchars($backendDir) ?></code> (<?= file_exists($backendDir) ? '<span class="success">Found</span>' : '<span class="error">Not Found</span>' ?>)</td></tr>
            <tr><td style="padding:6px 0;">Detected Zip Archive:</td><td>
                <?php if ($zipPath): ?>
                    <span class="success"><?= htmlspecialchars(basename($zipPath)) ?></span> (<?= round(filesize($zipPath) / 1024 / 1024, 2) ?> MB)
                <?php else: ?>
                    <span class="error">None detected in public_html/ or fieldy/</span>
                <?php endif; ?>
            </td></tr>
        </table>
    </div>

    <?php if ($action === 'extract' && $zipPath): ?>
        <div class="card">
            <h3 style="margin-top:0; color:#e2e8f0;">Executing Deployment...</h3>
            <pre><?php
            $zip = new ZipArchive();
            if ($zip->open($zipPath) === true) {
                $extractedCount = 0;
                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $entry = $zip->getNameIndex($i);

                    // Skip mac / hidden files
                    if (str_starts_with($entry, '__MACOSX') || str_contains($entry, '.DS_Store')) {
                        continue;
                    }

                    if (str_starts_with($entry, 'fieldy/')) {
                        $rel = substr($entry, 7);
                        if (empty($rel)) continue;
                        $dest = $fieldyDir . '/' . $rel;
                    } elseif (str_starts_with($entry, 'fieldy_backend/')) {
                        $rel = substr($entry, 15);
                        if (empty($rel)) continue;
                        $dest = $backendDir . '/' . $rel;
                    } else {
                        // Direct extract relative to public_html
                        $dest = $publicHtmlDir . '/' . $entry;
                    }

                    if (str_ends_with($entry, '/')) {
                        if (!is_dir($dest)) {
                            @mkdir($dest, 0755, true);
                        }
                    } else {
                        $dir = dirname($dest);
                        if (!is_dir($dir)) {
                            @mkdir($dir, 0755, true);
                        }
                        $content = $zip->getFromIndex($i);
                        file_put_contents($dest, $content);
                        $extractedCount++;
                    }
                }
                $zip->close();
                echo "<span class='success'>✓ Extracted {$extractedCount} files successfully into fieldy and fieldy_backend!</span>\n";

                // Clear Laravel compiled views and caches
                $cacheDirs = [
                    $backendDir . '/storage/framework/views',
                    $backendDir . '/bootstrap/cache',
                ];
                foreach ($cacheDirs as $cDir) {
                    if (is_dir($cDir)) {
                        $files = glob($cDir . '/*');
                        foreach ($files as $f) {
                            if (is_file($f) && basename($f) !== '.gitignore') {
                                @unlink($f);
                            }
                        }
                    }
                }
                echo "<span class='success'>✓ Cleared storage/framework/views and bootstrap/cache!</span>\n";

                // Run migrations if artisan exists
                if (file_exists($backendDir . '/artisan')) {
                    echo "Running database migrations:\n";
                    $output = [];
                    $code = 0;
                    @exec('php ' . escapeshellarg($backendDir . '/artisan') . ' migrate --force 2>&1', $output, $code);
                    if ($output) {
                        echo implode("\n", $output) . "\n";
                    }
                }

                echo "\n<span class='success'>DEPLOYMENT COMPLETED! All updates are now LIVE!</span>\n";
            } else {
                echo "<span class='error'>Failed to open zip archive: {$zipPath}</span>\n";
            }
            ?></pre>
            <div style="margin-top:16px;">
                <a href="/fieldy/admin/login" class="btn">Go to Fieldy Login &rarr;</a>
            </div>
        </div>
    <?php endif; ?>

    <?php if ($zipPath): ?>
        <div class="card" style="border-color:#f97316;">
            <h3 style="margin-top:0; color:#f97316;">Ready to Deploy</h3>
            <p style="font-size:13px; color:#cbd5e1;">Found package <code><?= htmlspecialchars(basename($zipPath)) ?></code> ready for extraction.</p>
            <a href="?action=extract" class="btn">🚀 Extract & Deploy Updates Now</a>
        </div>
    <?php endif; ?>

    <div class="card">
        <h3 style="margin-top:0; color:#e2e8f0;">Upload Updated Zip Directly</h3>
        <p class="info">Select <code>fieldy-fix-public_html.zip</code> from your computer to upload directly to the server:</p>
        <form method="POST" enctype="multipart/form-data">
            <input type="file" name="zip_file" accept=".zip" required style="font-size:13px; color:#cbd5e1; margin-bottom:12px; display:block;">
            <button type="submit" class="btn btn-secondary">Upload & Prepare Package</button>
        </form>
    </div>

    <div style="text-align:center; margin-top:24px;">
        <a href="/fieldy/admin/login" style="color:#94a3b8; font-size:13px; text-decoration:none;">&larr; Return to Fieldy Control Panel</a>
    </div>
</div>
</body>
</html>
