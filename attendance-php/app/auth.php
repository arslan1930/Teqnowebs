<?php

declare(strict_types=1);

function current_user(): ?array
{
    $id = $_SESSION['staff_id'] ?? null;
    if (!$id) {
        return null;
    }
    static $cached;
    if ($cached && (string) $cached['id'] === (string) $id) {
        return $cached;
    }
    $stmt = db()->prepare('SELECT id, email, full_name, role, staff_group, active FROM staff_profiles WHERE id = ?');
    $stmt->execute([(string) $id]);
    $cached = $stmt->fetch() ?: null;
    if (!$cached || !(int) $cached['active']) {
        unset($_SESSION['staff_id']);
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
        redirect('/dashboard');
    }
    return $user;
}

function attempt_login(string $email, string $password): bool
{
    $stmt = db()->prepare('SELECT * FROM staff_profiles WHERE lower(email) = lower(?) LIMIT 1');
    $stmt->execute([trim($email)]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, (string) $user['password_hash'])) {
        return false;
    }
    if (!(int) $user['active']) {
        flash('error', 'This account is deactivated. Contact admin.');
        return false;
    }
    session_regenerate_id(true);
    $_SESSION['staff_id'] = (string) $user['id'];
    return true;
}

function logout_user(): void
{
    unset($_SESSION['staff_id']);
    session_regenerate_id(true);
}
