<?php

declare(strict_types=1);

/**
 * Copy to config.local.php on the server and fill in MySQL details.
 * Defaults use SQLite in storage/ for local testing.
 */
return [
    'app_name' => 'Teqnowebs',
    'app_url' => getenv('APP_URL') ?: 'http://127.0.0.1:8080',
    'debug' => (bool) (getenv('APP_DEBUG') ?: false),

    // sqlite | mysql
    'db_driver' => getenv('DB_DRIVER') ?: 'sqlite',
    'sqlite_path' => __DIR__ . '/storage/teqnowebs.sqlite',

    'mysql' => [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'port' => getenv('DB_PORT') ?: '3306',
        'database' => getenv('DB_DATABASE') ?: 'teqnowebs',
        'username' => getenv('DB_USERNAME') ?: 'root',
        'password' => getenv('DB_PASSWORD') ?: '',
        'charset' => 'utf8mb4',
    ],

    'contact' => [
        'email' => 'Support@teqnowebs.com',
        'phone' => '+447445152374',
        'phone_href' => 'tel:+447445152374',
        'address' => 'Office no.97, D Ground, Chenone Road, Faisalabad, Pakistan.',
        'linkedin_href' => 'https://www.linkedin.com/company/teqnowebs-seo-agency/',
        'linkedin_label' => 'linkedin.com/company/teqnowebs-seo-agency',
        'reply_time' => 'Within 1 business day',
    ],

    'tools' => [
        'attendance' => getenv('ATTENDANCE_URL') ?: 'https://attendance.teqnowebs.com',
        'ops' => getenv('OPS_URL') ?: 'https://ops.teqnowebs.com',
    ],

    // Change after first login on production
    'seed_password' => 'teqnowebs123',
];
