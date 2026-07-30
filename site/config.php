<?php

declare(strict_types=1);

/**
 * App config — secrets and DB come from .env only (see .env.example).
 * Optional config.local.php can still override for one-off server tweaks.
 */
load_env();

$phone = (string) env('CONTACT_PHONE', '+447445152374');

return [
    'app_name' => (string) env('APP_NAME', 'Teqnowebs'),
    'app_url' => rtrim((string) env('APP_URL', 'http://localhost/teqnowebs'), '/'),
    'debug' => env_bool('APP_DEBUG', false),

    // mysql | sqlite — credentials ONLY from .env (no hardcoded fallbacks)
    'db_driver' => (string) env('DB_DRIVER', 'mysql'),
    'sqlite_path' => __DIR__ . '/storage/teqnowebs.sqlite',

    'mysql' => [
        'host' => env_required('DB_HOST'),
        'port' => (string) env('DB_PORT', '3306'),
        'database' => env_required('DB_DATABASE'),
        'username' => env_required('DB_USERNAME'),
        'password' => env_required('DB_PASSWORD', true),
        'charset' => 'utf8mb4',
    ],

    'users' => [
        'admin' => [
            'name' => (string) env('ADMIN_NAME', 'Teqnowebs Admin'),
            'email' => strtolower(env_required('ADMIN_EMAIL')),
            'password' => env_required('ADMIN_PASSWORD'),
        ],
        'staff' => [
            'name' => (string) env('STAFF_NAME', 'Teqnowebs Staff'),
            'email' => strtolower(env_required('STAFF_EMAIL')),
            'password' => env_required('STAFF_PASSWORD'),
        ],
    ],

    'contact' => [
        'email' => (string) env('CONTACT_EMAIL', 'Support@teqnowebs.com'),
        'phone' => $phone,
        'phone_href' => 'tel:' . preg_replace('/[^\d+]/', '', $phone),
        'address' => (string) env(
            'CONTACT_ADDRESS',
            'Office no.97, D Ground, Chenone Road, Faisalabad, Pakistan.'
        ),
        'linkedin_href' => (string) env(
            'CONTACT_LINKEDIN',
            'https://www.linkedin.com/company/teqnowebs-seo-agency/'
        ),
        'linkedin_label' => (string) env(
            'CONTACT_LINKEDIN_LABEL',
            'linkedin.com/company/teqnowebs-seo-agency'
        ),
        'reply_time' => (string) env('CONTACT_REPLY_TIME', 'Within 1 business day'),
    ],

    'tools' => [
        'attendance' => (string) env('ATTENDANCE_URL', 'http://localhost/attendance'),
        'ops' => (string) env('OPS_URL', 'http://localhost/ops'),
    ],
];
