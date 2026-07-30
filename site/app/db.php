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

    migrate($pdo);
    return $pdo;
}

function migrate(PDO $pdo): void
{
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    $id = $driver === 'mysql' ? 'INT AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
    $bool = $driver === 'mysql' ? 'TINYINT(1) NOT NULL DEFAULT 0' : 'INTEGER NOT NULL DEFAULT 0';
    $text = $driver === 'mysql' ? 'LONGTEXT' : 'TEXT';

    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id $id,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(190) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_admin $bool,
        created_at TEXT
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS posts (
        id $id,
        title VARCHAR(200) NOT NULL,
        slug VARCHAR(220) NOT NULL UNIQUE,
        excerpt VARCHAR(500),
        body $text NOT NULL,
        published_at TEXT,
        created_at TEXT,
        updated_at TEXT
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS team_members (
        id $id,
        name VARCHAR(120) NOT NULL,
        role VARCHAR(160) NOT NULL,
        group_key VARCHAR(80) NOT NULL,
        group_label VARCHAR(120) NOT NULL,
        photo VARCHAR(255),
        sort_order INT NOT NULL DEFAULT 0
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS contact_inquiries (
        id $id,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(190) NOT NULL,
        company VARCHAR(190),
        phone VARCHAR(60),
        interest VARCHAR(120),
        message $text NOT NULL,
        created_at TEXT
    )");

    seed_if_empty($pdo);
    fix_team_spellings($pdo);
}

function fix_team_spellings(PDO $pdo): void
{
    $pdo->prepare('UPDATE team_members SET name = ?, photo = ? WHERE name = ? OR photo = ?')
        ->execute(['Sheharyar', 'team/sheharyar.png', 'Sheharyar', 'team/sheharyar.png']);
}

function seed_if_empty(PDO $pdo): void
{
    $users = app_config()['users'];
    $admin = $users['admin'];
    $staff = $users['staff'];
    $now = date('c');

    $count = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    if ($count === 0) {
        $ins = $pdo->prepare('INSERT INTO users (name, email, password, is_admin, created_at) VALUES (?, ?, ?, ?, ?)');
        $ins->execute([
            $admin['name'],
            $admin['email'],
            password_hash($admin['password'], PASSWORD_DEFAULT),
            1,
            $now,
        ]);
        $ins->execute([
            $staff['name'],
            $staff['email'],
            password_hash($staff['password'], PASSWORD_DEFAULT),
            0,
            $now,
        ]);

        $pdo->prepare('INSERT INTO posts (title, slug, excerpt, body, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
            ->execute([
                'Welcome to the Teqnowebs blog',
                'welcome-to-teqnowebs-blog',
                'A starter post so your blog is ready on day one. Edit posts from /admin — no framework rebuild required.',
                "Welcome to the Teqnowebs blog. This sample post ships with the site so /blog is never empty.\n\nHow publishing works\n\nAdd, edit, or delete posts in the PHP admin at /admin. Changes go live immediately on Hostinger after save.",
                '2026-07-01T10:00:00+00:00',
                $now,
                $now,
            ]);

        $roster = [
            ['M Arslan', 'Head of Technical Operations', 'leadership-tech', 'Leadership & Tech', 'team/m-arslan.jpg', 1],
            ['Sheharyar', 'Lead Web Developer', 'leadership-tech', 'Leadership & Tech', 'team/sheharyar.png', 2],
            ['Rehan Haider', 'AI Solutions Specialist', 'leadership-tech', 'Leadership & Tech', 'team/rehan-haider.jpg', 3],
            ['Umar Ul Zaman', 'Human Resources Manager', 'leadership-tech', 'Leadership & Tech', 'team/umar-ul-zaman.jpg', 4],
            ['Subhan Hameed', 'Outreach Manager', 'growth-outreach', 'Growth & Outreach', 'team/subhan-hameed.jpg', 5],
            ['Muhammad Zohaib', 'Partnerships Manager', 'growth-outreach', 'Growth & Outreach', 'team/muhammad-zohaib.jpg', 6],
            ['Faizan Raza', 'Communications Manager', 'growth-outreach', 'Growth & Outreach', 'team/faizan-raza.jpg', 7],
            ['Mahnoor Kanwal', 'Communications & Link Building Lead', 'content-seo', 'Content & SEO', 'team/mahnoor-kanwal.jpg', 8],
            ['Maleeha', 'SEO Link Building Specialist', 'content-seo', 'Content & SEO', 'team/maleeha.jpg', 9],
            ['Maneesa Mahin', 'SEO Link Building Specialist', 'content-seo', 'Content & SEO', 'team/maneesa-mahin.jpg', 10],
            ['Ayesha', 'Senior Content Strategist', 'content-seo', 'Content & SEO', 'team/ayesha.jpg', 11],
        ];

        $tm = $pdo->prepare('INSERT INTO team_members (name, role, group_key, group_label, photo, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
        foreach ($roster as $row) {
            $tm->execute($row);
        }
        return;
    }

    // Local only: keep admin/staff passwords in sync with .env
    if (!empty(app_config()['debug'])) {
        sync_seed_user($pdo, $admin, true);
        sync_seed_user($pdo, $staff, false);
    }
}

function sync_seed_user(PDO $pdo, array $account, bool $isAdmin): void
{
    $stmt = $pdo->prepare('SELECT id, password FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$account['email']]);
    $row = $stmt->fetch();
    $hash = password_hash($account['password'], PASSWORD_DEFAULT);

    if (!$row) {
        $pdo->prepare('INSERT INTO users (name, email, password, is_admin, created_at) VALUES (?, ?, ?, ?, ?)')
            ->execute([$account['name'], $account['email'], $hash, $isAdmin ? 1 : 0, date('c')]);
        return;
    }

    if (!password_verify($account['password'], (string) $row['password'])) {
        $pdo->prepare('UPDATE users SET name = ?, password = ?, is_admin = ? WHERE id = ?')
            ->execute([$account['name'], $hash, $isAdmin ? 1 : 0, (int) $row['id']]);
    }
}
