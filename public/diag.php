<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

echo "<h2>Step 1: Environment & Paths</h2>";
echo "PHP Version: " . PHP_VERSION . "<br>";
echo "Current File: " . __FILE__ . "<br>";
echo "Base Dir: " . dirname(__DIR__) . "<br>";

$possibleBackend = [
    dirname(__DIR__) . '/fieldy_backend',
    __DIR__ . '/../fieldy_backend',
    dirname(__DIR__) . '/fieldy',
];

$backendPath = null;
foreach ($possibleBackend as $p) {
    if (file_exists($p . '/vendor/autoload.php')) {
        $backendPath = $p;
        break;
    }
}

echo "<h2>Step 2: Checking vendor/autoload.php</h2>";
if ($backendPath) {
    echo "Found backend at: <code>{$backendPath}</code><br>";
    try {
        require $backendPath . '/vendor/autoload.php';
        echo "<span style='color:green'>Autoload SUCCESS.</span><br>";
    } catch (\Throwable $e) {
        echo "<span style='color:red'>Autoload FAILED: " . $e->getMessage() . "</span><br>";
    }
} else {
    echo "<span style='color:red'>Could not find fieldy_backend/vendor/autoload.php!</span><br>";
}

echo "<h2>Step 3: Checking bootstrap/app.php</h2>";
if ($backendPath && file_exists($backendPath . '/bootstrap/app.php')) {
    try {
        $app = require_once $backendPath . '/bootstrap/app.php';
        echo "<span style='color:green'>Bootstrap SUCCESS. App: " . get_class($app) . "</span><br>";
    } catch (\Throwable $e) {
        echo "<span style='color:red'>Bootstrap FAILED: " . $e->getMessage() . "</span><br>";
    }
} else {
    echo "<span style='color:red'>bootstrap/app.php DOES NOT EXIST!</span><br>";
}

echo "<h2>Step 4: Checking Storage & Cache Writable</h2>";
if ($backendPath) {
    $storage = $backendPath . '/storage';
    $cache = $backendPath . '/bootstrap/cache';
    echo "storage writable: " . (is_writable($storage) ? '<span style=' . "'color:green'>YES</span>" : '<span style=' . "'color:red'>NO</span>") . "<br>";
    echo "bootstrap/cache writable: " . (is_writable($cache) ? '<span style=' . "'color:green'>YES</span>" : '<span style=' . "'color:red'>NO</span>") . "<br>";
}
