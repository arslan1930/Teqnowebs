<?php

declare(strict_types=1);

/** Local overrides — copy to config.local.php for SQLite without .env MySQL. */
return [
    'debug' => true,
    'db_driver' => 'sqlite',
    'mysql' => [
        'host' => 'localhost',
        'port' => '3306',
        'database' => 'attendance',
        'username' => 'root',
        'password' => '',
        'charset' => 'utf8mb4',
    ],
];
