<?php

declare(strict_types=1);

/**
 * Copy this file to config.local.php (same folder as config.php)
 * and adjust for Hostinger MySQL.
 */
return [
    'app_url' => 'https://teqnowebs.com',
    'debug' => false,
    'db_driver' => 'mysql',
    'mysql' => [
        'host' => 'localhost',
        'port' => '3306',
        'database' => 'teqnowebs',
        'username' => 'YOUR_DB_USER',
        'password' => 'YOUR_DB_PASSWORD',
        'charset' => 'utf8mb4',
    ],
    'tools' => [
        'attendance' => 'https://attendance.teqnowebs.com',
        'ops' => 'https://ops.teqnowebs.com',
    ],
];
