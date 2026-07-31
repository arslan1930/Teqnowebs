<?php

declare(strict_types=1);

function current_user(): ?array
{
    $id = $_SESSION['user_id'] ?? null;
    if (!$id) {
        return null;
    }
    static $cached;
    if ($cached && (int) $cached['id'] === (int) $id) {
        return $cached;
    }
    $stmt = db()->prepare('SELECT id, name, email, is_admin FROM users WHERE id = ?');
    $stmt->execute([(int) $id]);
    $cached = $stmt->fetch() ?: null;
    if (!$cached) {
        unset($_SESSION['user_id']);
    }
    return $cached ?: null;
}

function require_login(): array
{
    $user = current_user();
    if (!$user) {
        flash('error', 'Please sign in.');
        redirect('/login');
    }
    return $user;
}

function require_admin(): array
{
    $user = require_login();
    if (!(int) $user['is_admin']) {
        http_response_code(403);
        exit('Admin only');
    }
    return $user;
}

function attempt_login(string $email, string $password): bool
{
    $stmt = db()->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([strtolower(trim($email))]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, $user['password'])) {
        return false;
    }
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $user['id'];
    return true;
}

function logout_user(): void
{
    unset($_SESSION['user_id']);
    session_regenerate_id(true);
}
