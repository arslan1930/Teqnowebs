<?php

declare(strict_types=1);

function load_env(?string $path = null): void
{
    static $loaded = false;
    if ($loaded) {
        return;
    }
    $loaded = true;

    $file = $path ?? dirname(__DIR__) . '/.env';
    if (!is_file($file) || !is_readable($file)) {
        return;
    }

    $lines = file($file, FILE_IGNORE_NEW_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (!str_contains($line, '=')) {
            continue;
        }

        [$name, $value] = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        if ($name === '') {
            continue;
        }

        if (
            (str_starts_with($value, '"') && str_ends_with($value, '"'))
            || (str_starts_with($value, "'") && str_ends_with($value, "'"))
        ) {
            $value = substr($value, 1, -1);
        }

        $existing = $_ENV[$name] ?? $_SERVER[$name] ?? getenv($name);
        if ($existing !== false && $existing !== null && $existing !== '') {
            continue;
        }

        putenv("{$name}={$value}");
        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }
}

function env_has(string $key): bool
{
    if (array_key_exists($key, $_ENV) || array_key_exists($key, $_SERVER)) {
        return true;
    }
    return getenv($key) !== false;
}

function env(string $key, mixed $default = null): mixed
{
    if (!env_has($key)) {
        return $default;
    }

    $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
    if ($value === false || $value === null) {
        return $default;
    }

    if ($value === '') {
        return '';
    }

    return match (strtolower((string) $value)) {
        'true', '(true)' => true,
        'false', '(false)' => false,
        'null', '(null)' => null,
        default => $value,
    };
}

function env_bool(string $key, bool $default = false): bool
{
    $value = env($key, $default);
    if (is_bool($value)) {
        return $value;
    }
    return filter_var((string) $value, FILTER_VALIDATE_BOOLEAN);
}

function env_required(string $key, bool $allowEmpty = false): string
{
    if (!env_has($key)) {
        throw new RuntimeException("Missing required .env key: {$key}. Copy .env.example to .env and fill it in.");
    }
    $value = env($key, '');
    $str = $value === null ? '' : (string) $value;
    if ($str === '' && !$allowEmpty) {
        throw new RuntimeException("Required .env key {$key} is empty.");
    }
    return $str;
}
