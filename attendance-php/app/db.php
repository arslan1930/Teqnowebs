<?php

declare(strict_types=1);

function db(): PDO
{
    static $pdo;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = app_config();
    $driver = $config['db_driver'] ?? 'mysql';

    if ($driver === 'mysql') {
        $m = $config['mysql'];
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            $m['host'],
            $m['port'],
            $m['database'],
            $m['charset']
        );
        $pdo = new PDO($dsn, $m['username'], $m['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } else {
        $path = $config['sqlite_path'];
        $dir = dirname($path);
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $pdo = new PDO('sqlite:' . $path, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $pdo->exec('PRAGMA foreign_keys = ON');
    }

    migrate_attendance($pdo);
    return $pdo;
}

function migrate_attendance(PDO $pdo): void
{
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    $text = $driver === 'mysql' ? 'LONGTEXT' : 'TEXT';

    $pdo->exec("CREATE TABLE IF NOT EXISTS staff_profiles (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(190) NOT NULL UNIQUE,
        full_name VARCHAR(160) NOT NULL,
        role VARCHAR(20) NOT NULL,
        staff_group VARCHAR(20) NOT NULL,
        active TINYINT(1) NOT NULL DEFAULT 1,
        password_hash VARCHAR(255) NOT NULL,
        created_at VARCHAR(40) NOT NULL
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS attendance_events (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        type VARCHAR(20) NOT NULL,
        note $text,
        client_ip VARCHAR(80),
        is_manual TINYINT(1) NOT NULL DEFAULT 0,
        edited_by VARCHAR(64),
        created_at VARCHAR(40) NOT NULL
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS office_timings (
        staff_group VARCHAR(20) PRIMARY KEY,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        late_after_minutes INT NOT NULL DEFAULT 15
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS company_holidays (
        id VARCHAR(64) PRIMARY KEY,
        holiday_date VARCHAR(20) NOT NULL UNIQUE,
        title VARCHAR(200) NOT NULL,
        note $text,
        created_at VARCHAR(40) NOT NULL
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS leave_requests (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        leave_date VARCHAR(20) NOT NULL,
        reason $text,
        status VARCHAR(20) NOT NULL,
        created_at VARCHAR(40) NOT NULL,
        UNIQUE(user_id, leave_date)
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS app_settings (
        id INT PRIMARY KEY,
        timezone VARCHAR(80) NOT NULL,
        allowed_ips $text NOT NULL
    )");

    seed_attendance($pdo);
}

function seed_attendance(PDO $pdo): void
{
    $count = (int) $pdo->query('SELECT COUNT(*) FROM staff_profiles')->fetchColumn();
    if ($count > 0) {
        return;
    }

    $now = date('c');
    $hash = password_hash('attendance123', PASSWORD_DEFAULT);
    $users = [
        ['admin-1', 'admin@teqnowebs.com', 'Office Admin', 'admin', 'male'],
        ['staff-f-1', 'staff@teqnowebs.com', 'Ayesha Khan', 'staff', 'female'],
        ['staff-f-2', 'sara@teqnowebs.com', 'Sara Ahmed', 'staff', 'female'],
        ['staff-f-3', 'fatima@teqnowebs.com', 'Fatima Noor', 'staff', 'female'],
        ['staff-m-1', 'hr@teqnowebs.com', 'Hassan Ali', 'staff', 'male'],
        ['staff-m-2', 'bilal@teqnowebs.com', 'Bilal Raza', 'staff', 'male'],
        ['staff-m-3', 'umar@teqnowebs.com', 'Umar Siddiqui', 'staff', 'male'],
        ['staff-m-4', 'zain@teqnowebs.com', 'Zain Malik', 'staff', 'male'],
    ];
    $ins = $pdo->prepare(
        'INSERT INTO staff_profiles (id, email, full_name, role, staff_group, active, password_hash, created_at)
         VALUES (?, ?, ?, ?, ?, 1, ?, ?)'
    );
    foreach ($users as $u) {
        $ins->execute([$u[0], $u[1], $u[2], $u[3], $u[4], $hash, $now]);
    }

    $pdo->exec(
        "INSERT INTO office_timings (staff_group, start_time, end_time, late_after_minutes) VALUES
         ('female','09:00','17:00',15), ('male','09:00','18:00',15)"
    );
    $tz = app_config()['timezone'] ?? 'Asia/Karachi';
    $pdo->prepare('INSERT INTO app_settings (id, timezone, allowed_ips) VALUES (1, ?, ?)')
        ->execute([$tz, '[]']);
}

function list_staff_profiles(?bool $activeOnly = null): array
{
    $sql = 'SELECT id, email, full_name, role, staff_group, active, created_at FROM staff_profiles ORDER BY full_name ASC';
    $rows = db()->query($sql)->fetchAll();
    if ($activeOnly === true) {
        return array_values(array_filter($rows, fn ($r) => (int) $r['active'] === 1));
    }
    return $rows;
}

function list_attendance_staff(): array
{
    return array_values(array_filter(
        list_staff_profiles(true),
        fn ($p) => ($p['role'] ?? '') === 'staff'
    ));
}

function get_settings(): array
{
    $row = db()->query('SELECT * FROM app_settings WHERE id = 1')->fetch();
    $ips = [];
    if ($row) {
        try {
            $ips = json_decode((string) $row['allowed_ips'], true) ?: [];
        } catch (Throwable) {
            $ips = [];
        }
    }
    return [
        'timezone' => $row['timezone'] ?? app_timezone(),
        'allowed_ips' => is_array($ips) ? $ips : [],
    ];
}

function save_settings(string $timezone, array $allowedIps): void
{
    $json = json_encode(array_values(array_filter(array_map('trim', $allowedIps)))) ?: '[]';
    $driver = db()->getAttribute(PDO::ATTR_DRIVER_NAME);
    if ($driver === 'mysql') {
        db()->prepare(
            'INSERT INTO app_settings (id, timezone, allowed_ips) VALUES (1, ?, ?)
             ON DUPLICATE KEY UPDATE timezone = VALUES(timezone), allowed_ips = VALUES(allowed_ips)'
        )->execute([$timezone, $json]);
    } else {
        db()->prepare(
            'INSERT INTO app_settings (id, timezone, allowed_ips) VALUES (1, ?, ?)
             ON CONFLICT(id) DO UPDATE SET timezone=excluded.timezone, allowed_ips=excluded.allowed_ips'
        )->execute([$timezone, $json]);
    }
}

function list_timings(): array
{
    return db()->query('SELECT * FROM office_timings')->fetchAll();
}

function timing_for_group(string $group): ?array
{
    foreach (list_timings() as $t) {
        if ($t['staff_group'] === $group) {
            return $t;
        }
    }
    return null;
}

function list_holidays(): array
{
    return db()->query('SELECT * FROM company_holidays ORDER BY holiday_date ASC')->fetchAll();
}

function holiday_on_date(string $dateStr): ?array
{
    $stmt = db()->prepare('SELECT * FROM company_holidays WHERE holiday_date = ?');
    $stmt->execute([$dateStr]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function list_leaves(?string $userId = null): array
{
    if ($userId) {
        $stmt = db()->prepare(
            'SELECT l.*, p.full_name FROM leave_requests l
             LEFT JOIN staff_profiles p ON p.id = l.user_id
             WHERE l.user_id = ? ORDER BY l.leave_date DESC'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
    return db()->query(
        'SELECT l.*, p.full_name FROM leave_requests l
         LEFT JOIN staff_profiles p ON p.id = l.user_id
         ORDER BY l.leave_date DESC'
    )->fetchAll();
}

function approved_leave_on_date(string $userId, string $dateStr): ?array
{
    $stmt = db()->prepare(
        "SELECT * FROM leave_requests WHERE user_id = ? AND leave_date = ? AND status = 'approved'"
    );
    $stmt->execute([$userId, $dateStr]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function list_events(?string $userId = null): array
{
    if ($userId) {
        $stmt = db()->prepare(
            'SELECT * FROM attendance_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 2000'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
    return db()->query('SELECT * FROM attendance_events ORDER BY created_at DESC LIMIT 2000')->fetchAll();
}

function insert_event(array $input): array
{
    $id = new_id('evt');
    $createdAt = $input['created_at'] ?? date('c');
    db()->prepare(
        'INSERT INTO attendance_events (id, user_id, type, note, client_ip, is_manual, edited_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $id,
        $input['user_id'],
        $input['type'],
        $input['note'] ?? null,
        $input['client_ip'] ?? null,
        !empty($input['is_manual']) ? 1 : 0,
        $input['edited_by'] ?? null,
        $createdAt,
    ]);
    return [
        'id' => $id,
        'user_id' => $input['user_id'],
        'type' => $input['type'],
        'note' => $input['note'] ?? null,
        'client_ip' => $input['client_ip'] ?? null,
        'is_manual' => !empty($input['is_manual']) ? 1 : 0,
        'edited_by' => $input['edited_by'] ?? null,
        'created_at' => $createdAt,
    ];
}
