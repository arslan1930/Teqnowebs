<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function app_config(): array
{
    static $config;
    if ($config === null) {
        $config = require dirname(__DIR__) . '/config.php';
        $local = dirname(__DIR__) . '/config.local.php';
        if (is_file($local)) {
            $config = array_replace_recursive($config, require $local);
        }
    }
    return $config;
}

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function url(string $path = '/'): string
{
    // Prefer the configured app URL path (handles subdirectory deployments)
    $config = app_config();
    $appPath = parse_url($config['app_url'] ?? '', PHP_URL_PATH) ?: '';

    // Fallback to script directory when app_url has no path
    if ($appPath === '') {
        $appPath = dirname($_SERVER['SCRIPT_NAME'] ?? '') ?: '';
    }
    if ($appPath === '/' || $appPath === '\\') {
        $appPath = '';
    }

    if ($path === '' || $path === '/') {
        return $appPath === '' ? '/' : rtrim($appPath, '/') . '/';
    }

    return rtrim($appPath, '/') . '/' . ltrim($path, '/');
}

function redirect(string $path): never
{
    header('Location: ' . (str_starts_with($path, 'http') ? $path : url($path)));
    exit;
}

function flash(string $key, ?string $message = null): ?string
{
    if ($message !== null) {
        $_SESSION['_flash'][$key] = $message;
        return null;
    }
    $val = $_SESSION['_flash'][$key] ?? null;
    unset($_SESSION['_flash'][$key]);
    return $val;
}

function csrf_token(): string
{
    if (empty($_SESSION['_csrf'])) {
        $_SESSION['_csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="_token" value="' . e(csrf_token()) . '">';
}

function verify_csrf(): void
{
    $token = $_POST['_token'] ?? '';
    if (!is_string($token) || !hash_equals(csrf_token(), $token)) {
        http_response_code(419);
        exit('Invalid CSRF token');
    }
}

function slugify(string $text): string
{
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/', '-', $text) ?? '';
    return trim($text, '-') ?: 'item';
}

function view(string $name, array $data = []): void
{
    extract($data, EXTR_SKIP);
    $config = app_config();
    $user = current_user();
    require dirname(__DIR__) . '/views/' . $name . '.php';
}

function render(string $page, array $data = []): void
{
    $data['content_view'] = $page;
    view('layout', $data);
}

function request_path(): string
{
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    // Strip configured app path or script directory if app is not at domain root
    $script = dirname($_SERVER['SCRIPT_NAME'] ?? '');
    $configPath = parse_url(app_config()['app_url'] ?? '', PHP_URL_PATH) ?: '';
    $base = $configPath !== '' ? $configPath : $script;
    if ($base !== '/' && $base !== '\\' && $base !== '' && str_starts_with($uri, $base)) {
        $uri = substr($uri, strlen($base)) ?: '/';
    }
    return '/' . trim($uri, '/');
}

function method(): string
{
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

function is_post(): bool
{
    return method() === 'POST';
}
