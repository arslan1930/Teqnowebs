<?php

declare(strict_types=1);

function current_user(): ?array
{
    $id = $_SESSION['ops_user_id'] ?? null;
    if (!$id) {
        return null;
    }
    static $cached;
    if ($cached && (string) $cached['id'] === (string) $id) {
        return $cached;
    }
    $stmt = db()->prepare('SELECT id, email, full_name, role, active FROM users WHERE id = ?');
    $stmt->execute([(string) $id]);
    $cached = $stmt->fetch() ?: null;
    if (!$cached || !(int) $cached['active']) {
        unset($_SESSION['ops_user_id']);
        $cached = null;
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
    if (($user['role'] ?? '') !== 'admin') {
        flash('error', 'Admin only.');
        redirect('/home');
    }
    return $user;
}

function attempt_login(string $email, string $password): bool
{
    $stmt = db()->prepare('SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1');
    $stmt->execute([trim($email)]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, (string) $user['password_hash'])) {
        return false;
    }
    if (!(int) $user['active']) {
        flash('error', 'Account deactivated.');
        return false;
    }
    session_regenerate_id(true);
    $_SESSION['ops_user_id'] = (string) $user['id'];
    return true;
}

function logout_user(): void
{
    unset($_SESSION['ops_user_id']);
    session_regenerate_id(true);
}

function is_admin(?array $user = null): bool
{
    $user ??= current_user();
    return $user && ($user['role'] ?? '') === 'admin';
}
