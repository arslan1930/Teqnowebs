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

    migrate_ops($pdo);
    return $pdo;
}

function migrate_ops(PDO $pdo): void
{
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    $text = $driver === 'mysql' ? 'LONGTEXT' : 'TEXT';

    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(190) NOT NULL UNIQUE,
        full_name VARCHAR(160) NOT NULL,
        role VARCHAR(20) NOT NULL,
        active TINYINT(1) NOT NULL DEFAULT 1,
        password_hash VARCHAR(255) NOT NULL,
        created_at VARCHAR(40) NOT NULL
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        website VARCHAR(255),
        package_name VARCHAR(200),
        monthly_fee DOUBLE NOT NULL DEFAULT 0,
        start_date VARCHAR(20),
        active TINYINT(1) NOT NULL DEFAULT 1,
        notes $text,
        created_at VARCHAR(40) NOT NULL
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS link_tasks (
        id VARCHAR(64) PRIMARY KEY,
        client_id VARCHAR(64) NOT NULL,
        target_url VARCHAR(500),
        site_domain VARCHAR(255),
        link_type VARCHAR(80),
        status VARCHAR(40) NOT NULL,
        live_url VARCHAR(500),
        dr DOUBLE,
        price DOUBLE NOT NULL DEFAULT 0,
        cost DOUBLE NOT NULL DEFAULT 0,
        assignee_id VARCHAR(64),
        work_month VARCHAR(10) NOT NULL,
        notes $text,
        published_at VARCHAR(40),
        created_at VARCHAR(40) NOT NULL,
        updated_at VARCHAR(40) NOT NULL
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(64) PRIMARY KEY,
        month VARCHAR(10) NOT NULL,
        amount DOUBLE NOT NULL,
        label VARCHAR(200) NOT NULL,
        created_by VARCHAR(64),
        created_at VARCHAR(40) NOT NULL
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY,
        timezone VARCHAR(80) NOT NULL,
        currency VARCHAR(20) NOT NULL
    )");

    seed_ops($pdo);
}

function seed_ops(PDO $pdo): void
{
    $count = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    if ($count > 0) {
        return;
    }

    $now = date('c');
    $month = substr($now, 0, 7);
    $hash = password_hash('ops123', PASSWORD_DEFAULT);
    $users = [
        ['admin-1', 'admin@teqnowebs.com', 'Office Admin', 'admin'],
        ['staff-1', 'linker@teqnowebs.com', 'Ayesha Khan', 'staff'],
        ['staff-2', 'outreach@teqnowebs.com', 'Hassan Ali', 'staff'],
    ];
    $ins = $pdo->prepare(
        'INSERT INTO users (id, email, full_name, role, active, password_hash, created_at)
         VALUES (?, ?, ?, ?, 1, ?, ?)'
    );
    foreach ($users as $u) {
        $ins->execute([$u[0], $u[1], $u[2], $u[3], $hash, $now]);
    }

    $pdo->prepare('INSERT INTO settings (id, timezone, currency) VALUES (1, ?, ?)')
        ->execute([
            app_config()['timezone'] ?? 'Asia/Karachi',
            app_config()['currency'] ?? 'PKR',
        ]);

    $clientId = 'client-demo-1';
    $pdo->prepare(
        'INSERT INTO clients (id, name, website, package_name, monthly_fee, start_date, active, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)'
    )->execute([
        $clientId,
        'Demo Client Co',
        'https://democlient.example',
        '10 links / month',
        50000,
        $month . '-01',
        'Sample client for Ops desk',
        $now,
    ]);

    $pdo->prepare(
        'INSERT INTO link_tasks
         (id, client_id, target_url, site_domain, link_type, status, live_url, dr, price, cost, assignee_id, work_month, notes, published_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        new_id('task'),
        $clientId,
        'https://democlient.example/blog',
        'example-blog.com',
        'guest_post',
        'published',
        'https://example-blog.com/post',
        42,
        8000,
        3000,
        'staff-1',
        $month,
        'Seed published task',
        $now,
        $now,
        $now,
    ]);
}

/** @return list<string> */
function link_statuses(): array
{
    return ['queued', 'in_progress', 'published', 'live', 'lost'];
}

function status_label(string $status): string
{
    return match ($status) {
        'queued' => 'Queued',
        'in_progress' => 'In progress',
        'published' => 'Published',
        'live' => 'Live',
        'lost' => 'Lost',
        default => $status,
    };
}

function money(float|int|string $amount): string
{
    $cur = app_config()['currency'] ?? 'PKR';
    return $cur . ' ' . number_format((float) $amount, 0);
}

function current_month(): string
{
    return (new DateTimeImmutable('now', new DateTimeZone(app_config()['timezone'] ?? 'Asia/Karachi')))->format('Y-m');
}

function list_users(): array
{
    return db()->query('SELECT id, email, full_name, role, active, created_at FROM users ORDER BY full_name ASC')->fetchAll();
}

function list_clients(bool $activeOnly = false): array
{
    $sql = $activeOnly
        ? 'SELECT * FROM clients WHERE active = 1 ORDER BY name ASC'
        : 'SELECT * FROM clients ORDER BY name ASC';
    return db()->query($sql)->fetchAll();
}

function get_client(string $id): ?array
{
    $stmt = db()->prepare('SELECT * FROM clients WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function list_tasks(array $filters = []): array
{
    $where = [];
    $params = [];
    if (!empty($filters['client_id'])) {
        $where[] = 't.client_id = ?';
        $params[] = $filters['client_id'];
    }
    if (!empty($filters['status'])) {
        $where[] = 't.status = ?';
        $params[] = $filters['status'];
    }
    if (!empty($filters['month'])) {
        $where[] = 't.work_month = ?';
        $params[] = $filters['month'];
    }
    if (!empty($filters['assignee_id'])) {
        $where[] = 't.assignee_id = ?';
        $params[] = $filters['assignee_id'];
    }
    $clause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    $stmt = db()->prepare(
        "SELECT t.*, c.name AS client_name, u.full_name AS assignee_name
         FROM link_tasks t
         LEFT JOIN clients c ON c.id = t.client_id
         LEFT JOIN users u ON u.id = t.assignee_id
         {$clause}
         ORDER BY t.updated_at DESC
         LIMIT 2000"
    );
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function get_task(string $id): ?array
{
    $stmt = db()->prepare(
        'SELECT t.*, c.name AS client_name, u.full_name AS assignee_name
         FROM link_tasks t
         LEFT JOIN clients c ON c.id = t.client_id
         LEFT JOIN users u ON u.id = t.assignee_id
         WHERE t.id = ?'
    );
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function list_expenses(?string $month = null): array
{
    if ($month) {
        $stmt = db()->prepare('SELECT * FROM expenses WHERE month = ? ORDER BY created_at DESC');
        $stmt->execute([$month]);
        return $stmt->fetchAll();
    }
    return db()->query('SELECT * FROM expenses ORDER BY month DESC, created_at DESC')->fetchAll();
}

function compute_month_pnl(string $month): array
{
    $tasks = list_tasks(['month' => $month]);
    $billable = array_values(array_filter(
        $tasks,
        fn ($t) => in_array($t['status'], ['published', 'live'], true)
    ));
    $revenue = array_sum(array_map(fn ($t) => (float) $t['price'], $billable));
    $taskCosts = array_sum(array_map(fn ($t) => (float) $t['cost'], $billable));
    $expenses = array_sum(array_map(fn ($e) => (float) $e['amount'], list_expenses($month)));

    $byClient = [];
    foreach ($billable as $t) {
        $cid = (string) $t['client_id'];
        if (!isset($byClient[$cid])) {
            $byClient[$cid] = [
                'client_id' => $cid,
                'client_name' => $t['client_name'] ?? $cid,
                'revenue' => 0.0,
                'cost' => 0.0,
            ];
        }
        $byClient[$cid]['revenue'] += (float) $t['price'];
        $byClient[$cid]['cost'] += (float) $t['cost'];
    }
    $byClient = array_map(
        fn ($c) => $c + ['profit' => $c['revenue'] - $c['cost']],
        array_values($byClient)
    );
    usort($byClient, fn ($a, $b) => $b['profit'] <=> $a['profit']);

    $staff = array_values(array_filter(list_users(), fn ($u) => $u['role'] === 'staff'));
    $byStaff = [];
    foreach ($staff as $u) {
        $mine = array_values(array_filter($billable, fn ($t) => $t['assignee_id'] === $u['id']));
        $byStaff[] = [
            'user_id' => $u['id'],
            'user_name' => $u['full_name'],
            'published_count' => count($mine),
            'revenue' => array_sum(array_map(fn ($t) => (float) $t['price'], $mine)),
            'cost' => array_sum(array_map(fn ($t) => (float) $t['cost'], $mine)),
        ];
    }
    usort($byStaff, fn ($a, $b) => $b['published_count'] <=> $a['published_count']);

    return [
        'month' => $month,
        'revenue' => $revenue,
        'task_costs' => $taskCosts,
        'expenses' => $expenses,
        'profit' => $revenue - $taskCosts - $expenses,
        'by_client' => $byClient,
        'by_staff' => $byStaff,
    ];
}
