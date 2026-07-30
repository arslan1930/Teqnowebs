<?php

declare(strict_types=1);

load_env();

$local = [];
$localFile = __DIR__ . '/config.local.php';
if (is_file($localFile)) {
    $local = require $localFile;
}

$driver = (string) ($local['db_driver'] ?? env('DB_DRIVER', 'mysql'));

$config = [
    'app_name' => (string) env('APP_NAME', 'Teqnowebs Ops'),
    'app_url' => rtrim((string) env('APP_URL', 'http://localhost/ops'), '/'),
    'debug' => env_bool('APP_DEBUG', false),
    'timezone' => (string) env('APP_TIMEZONE', 'Asia/Karachi'),
    'currency' => (string) env('APP_CURRENCY', 'PKR'),

    'db_driver' => $driver,
    'sqlite_path' => __DIR__ . '/storage/ops.sqlite',

    'mysql' => [
        'host' => $driver === 'mysql' ? env_required('DB_HOST') : (string) env('DB_HOST', 'localhost'),
        'port' => (string) env('DB_PORT', '3306'),
        'database' => $driver === 'mysql' ? env_required('DB_DATABASE') : (string) env('DB_DATABASE', 'ops'),
        'username' => $driver === 'mysql' ? env_required('DB_USERNAME') : (string) env('DB_USERNAME', 'root'),
        'password' => $driver === 'mysql' ? env_required('DB_PASSWORD', true) : (string) env('DB_PASSWORD', ''),
        'charset' => 'utf8mb4',
    ],
];

return array_replace_recursive($config, $local);
