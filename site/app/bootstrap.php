<?php

declare(strict_types=1);

session_start();

require __DIR__ . '/env.php';
load_env();

require __DIR__ . '/helpers.php';
require __DIR__ . '/db.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/router.php';

$config = app_config();
if (!empty($config['debug'])) {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
}

// Ensure DB + seed on first hit
db();

dispatch();
