<?php

declare(strict_types=1);

function dispatch(): void
{
    $path = trim(request_path(), '/');
    $method = method();

    if ($path === '' || $path === 'index.php') {
        redirect(current_user() ? '/home' : '/login');
    }

    if ($method === 'GET' && $path === 'login') {
        if (current_user()) {
            redirect('/home');
        }
        render('login', ['title' => 'Sign in']);
        return;
    }

    if ($method === 'POST' && $path === 'login') {
        verify_csrf();
        if (attempt_login((string) ($_POST['email'] ?? ''), (string) ($_POST['password'] ?? ''))) {
            redirect('/home');
        }
        flash('error', 'Invalid email or password.');
        redirect('/login');
    }

    if ($method === 'POST' && $path === 'logout') {
        verify_csrf();
        logout_user();
        redirect('/login');
    }

    if ($method === 'GET' && $path === 'home') {
        ops_home();
        return;
    }
    if ($method === 'GET' && $path === 'clients') {
        ops_clients();
        return;
    }
    if ($method === 'GET' && $path === 'tasks') {
        ops_tasks();
        return;
    }
    if ($method === 'GET' && $path === 'pnl') {
        ops_pnl();
        return;
    }
    if ($method === 'GET' && $path === 'import') {
        require_login();
        render('import', ['title' => 'CSV import']);
        return;
    }
    if ($method === 'GET' && $path === 'team') {
        ops_team();
        return;
    }
    if ($method === 'GET' && $path === 'inventory') {
        ops_inventory();
        return;
    }

    if ($method === 'POST') {
        match ($path) {
            'clients/save' => ops_client_save(),
            'tasks/save' => ops_task_save(),
            'tasks/delete' => ops_task_delete(),
            'expenses/save' => ops_expense_save(),
            'expenses/delete' => ops_expense_delete(),
            'import' => ops_import_post(),
            'team/save' => ops_team_save(),
            'team/update' => ops_team_update(),
            'inventory/filter' => ops_inventory_filter(),
            'inventory/add' => ops_inventory_add(),
            'inventory/admin-add' => ops_inventory_admin_add(),
            default => null,
        };
        if (in_array($path, [
            'clients/save', 'tasks/save', 'tasks/delete', 'expenses/save',
            'expenses/delete', 'import', 'team/save', 'team/update',
            'inventory/filter', 'inventory/add', 'inventory/admin-add',
        ], true)) {
            return;
        }
    }

    http_response_code(404);
    render('login', ['title' => 'Not found', 'not_found' => true]);
}

function ops_home(): void
{
    $user = require_login();
    $month = current_month();
    $tasks = list_tasks(['month' => $month]);
    $pnl = compute_month_pnl($month);
    $queued = count(array_filter($tasks, fn ($t) => $t['status'] === 'queued'));
    $live = count(array_filter($tasks, fn ($t) => in_array($t['status'], ['published', 'live'], true)));
    render('home', [
        'title' => 'Home',
        'user' => $user,
        'month' => $month,
        'pnl' => $pnl,
        'queued' => $queued,
        'live' => $live,
        'recent' => array_slice($tasks, 0, 8),
        'clients' => list_clients(true),
    ]);
}

function ops_clients(): void
{
    require_login();
    $id = (string) ($_GET['id'] ?? '');
    $edit = $id ? get_client($id) : null;
    render('clients', [
        'title' => 'Clients',
        'clients' => list_clients(),
        'edit' => $edit,
        'tasks' => $id ? list_tasks(['client_id' => $id]) : [],
    ]);
}

function ops_client_save(): void
{
    verify_csrf();
    require_login();
    $id = trim((string) ($_POST['id'] ?? ''));
    $name = trim((string) ($_POST['name'] ?? ''));
    if ($name === '') {
        flash('error', 'Client name required.');
        redirect('/clients');
    }
    $active = isset($_POST['active']) ? 1 : 0;
    if ($id !== '') {
        db()->prepare(
            'UPDATE clients SET name=?, website=?, package_name=?, monthly_fee=?, start_date=?, active=?, notes=? WHERE id=?'
        )->execute([
            $name,
            trim((string) ($_POST['website'] ?? '')) ?: null,
            trim((string) ($_POST['package_name'] ?? '')) ?: null,
            (float) ($_POST['monthly_fee'] ?? 0),
            trim((string) ($_POST['start_date'] ?? '')) ?: null,
            $active,
            trim((string) ($_POST['notes'] ?? '')) ?: null,
            $id,
        ]);
        flash('ok', 'Client updated.');
        redirect('/clients?id=' . urlencode($id));
    }
    $newId = new_id('client');
    db()->prepare(
        'INSERT INTO clients (id, name, website, package_name, monthly_fee, start_date, active, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $newId,
        $name,
        trim((string) ($_POST['website'] ?? '')) ?: null,
        trim((string) ($_POST['package_name'] ?? '')) ?: null,
        (float) ($_POST['monthly_fee'] ?? 0),
        trim((string) ($_POST['start_date'] ?? '')) ?: null,
        $active,
        trim((string) ($_POST['notes'] ?? '')) ?: null,
        date('c'),
    ]);
    flash('ok', 'Client created.');
    redirect('/clients?id=' . urlencode($newId));
}

function ops_tasks(): void
{
    $user = require_login();
    $month = (string) ($_GET['month'] ?? current_month());
    $status = (string) ($_GET['status'] ?? '');
    $clientId = (string) ($_GET['client_id'] ?? '');
    $filters = ['month' => $month];
    if ($status !== '') {
        $filters['status'] = $status;
    }
    if ($clientId !== '') {
        $filters['client_id'] = $clientId;
    }
    if (!is_admin($user)) {
        $filters['assignee_id'] = $user['id'];
    }
    $editId = (string) ($_GET['edit'] ?? '');
    render('tasks', [
        'title' => 'Link tasks',
        'tasks' => list_tasks($filters),
        'clients' => list_clients(true),
        'users' => array_values(array_filter(list_users(), fn ($u) => (int) $u['active'] === 1)),
        'month' => $month,
        'status' => $status,
        'client_id' => $clientId,
        'edit' => $editId ? get_task($editId) : null,
        'user' => $user,
    ]);
}

function ops_task_save(): void
{
    verify_csrf();
    $user = require_login();
    $id = trim((string) ($_POST['id'] ?? ''));
    $clientId = (string) ($_POST['client_id'] ?? '');
    $status = (string) ($_POST['status'] ?? 'queued');
    $workMonth = (string) ($_POST['work_month'] ?? current_month());
    if ($clientId === '' || !in_array($status, link_statuses(), true)) {
        flash('error', 'Client and valid status required.');
        redirect('/tasks');
    }
    $assigneeId = trim((string) ($_POST['assignee_id'] ?? '')) ?: null;
    if (!is_admin($user)) {
        $assigneeId = $user['id'];
    }
    $now = date('c');
    $fields = [
        $clientId,
        trim((string) ($_POST['target_url'] ?? '')) ?: null,
        trim((string) ($_POST['site_domain'] ?? '')) ?: null,
        trim((string) ($_POST['link_type'] ?? '')) ?: null,
        $status,
        trim((string) ($_POST['live_url'] ?? '')) ?: null,
        ($_POST['dr'] ?? '') === '' ? null : (float) $_POST['dr'],
        (float) ($_POST['price'] ?? 0),
        (float) ($_POST['cost'] ?? 0),
        $assigneeId,
        $workMonth,
        trim((string) ($_POST['notes'] ?? '')) ?: null,
    ];

    if ($id !== '') {
        $cur = get_task($id);
        if (!$cur) {
            flash('error', 'Task not found.');
            redirect('/tasks');
        }
        $published = $cur['published_at'];
        if (!$published && in_array($status, ['published', 'live'], true)) {
            $published = $now;
        }
        db()->prepare(
            'UPDATE link_tasks SET client_id=?, target_url=?, site_domain=?, link_type=?, status=?, live_url=?,
             dr=?, price=?, cost=?, assignee_id=?, work_month=?, notes=?, published_at=?, updated_at=? WHERE id=?'
        )->execute([...$fields, $published, $now, $id]);
        flash('ok', 'Task updated.');
    } else {
        $published = in_array($status, ['published', 'live'], true) ? $now : null;
        db()->prepare(
            'INSERT INTO link_tasks
             (id, client_id, target_url, site_domain, link_type, status, live_url, dr, price, cost, assignee_id, work_month, notes, published_at, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )->execute([new_id('task'), ...$fields, $published, $now, $now]);
        flash('ok', 'Task created.');
    }
    redirect('/tasks?month=' . urlencode($workMonth));
}

function ops_task_delete(): void
{
    verify_csrf();
    require_admin();
    db()->prepare('DELETE FROM link_tasks WHERE id = ?')->execute([(string) ($_POST['id'] ?? '')]);
    flash('ok', 'Task deleted.');
    redirect('/tasks');
}

function ops_pnl(): void
{
    require_login();
    $month = (string) ($_GET['month'] ?? current_month());
    render('pnl', [
        'title' => 'P&L',
        'month' => $month,
        'pnl' => compute_month_pnl($month),
        'expenses' => list_expenses($month),
    ]);
}

function ops_expense_save(): void
{
    verify_csrf();
    require_admin();
    $month = (string) ($_POST['month'] ?? current_month());
    $label = trim((string) ($_POST['label'] ?? ''));
    $amount = (float) ($_POST['amount'] ?? 0);
    if ($label === '' || $amount <= 0) {
        flash('error', 'Label and amount required.');
        redirect('/pnl?month=' . urlencode($month));
    }
    db()->prepare(
        'INSERT INTO expenses (id, month, amount, label, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    )->execute([new_id('exp'), $month, $amount, $label, current_user()['id'] ?? null, date('c')]);
    flash('ok', 'Expense added.');
    redirect('/pnl?month=' . urlencode($month));
}

function ops_expense_delete(): void
{
    verify_csrf();
    require_admin();
    $month = (string) ($_POST['month'] ?? current_month());
    db()->prepare('DELETE FROM expenses WHERE id = ?')->execute([(string) ($_POST['id'] ?? '')]);
    flash('ok', 'Expense removed.');
    redirect('/pnl?month=' . urlencode($month));
}

function ops_import_post(): void
{
    verify_csrf();
    require_login();
    $text = '';
    if (!empty($_FILES['csv']['tmp_name']) && is_uploaded_file($_FILES['csv']['tmp_name'])) {
        $text = (string) file_get_contents($_FILES['csv']['tmp_name']);
    } else {
        $text = (string) ($_POST['csv_text'] ?? '');
    }
    try {
        $result = import_link_csv($text);
        $msg = 'Imported ' . $result['imported'] . ' row(s).';
        if ($result['errors']) {
            $msg .= ' Errors: ' . implode('; ', array_slice($result['errors'], 0, 5));
        }
        flash($result['imported'] ? 'ok' : 'error', $msg);
    } catch (Throwable $e) {
        flash('error', $e->getMessage());
    }
    redirect('/import');
}

function ops_inventory(): void
{
    $user = require_login();
    $results = $_SESSION['inventory_results'] ?? [];
    $newRaw = (string) ($_SESSION['inventory_new_raw'] ?? '');
    $filterMeta = $_SESSION['inventory_filter_meta'] ?? null;
    render('inventory', [
        'title' => 'Site inventory',
        'user' => $user,
        'old_sites' => list_inventory_site_names(),
        'new_raw' => $newRaw,
        'results' => is_array($results) ? $results : [],
        'filter_meta' => is_array($filterMeta) ? $filterMeta : null,
    ]);
}

function ops_inventory_filter(): void
{
    verify_csrf();
    require_login();
    $raw = (string) ($_POST['new_sites'] ?? '');
    $parsed = parse_site_list($raw);
    if (!$parsed) {
        flash('error', 'Paste at least one site name or URL in the new sites box.');
        $_SESSION['inventory_new_raw'] = $raw;
        $_SESSION['inventory_results'] = [];
        unset($_SESSION['inventory_filter_meta']);
        redirect('/inventory');
    }
    $filtered = filter_new_sites_against_inventory($parsed);
    $_SESSION['inventory_new_raw'] = $raw;
    $_SESSION['inventory_results'] = $filtered['results'];
    $_SESSION['inventory_filter_meta'] = [
        'input_count' => $filtered['input_count'],
        'excluded' => $filtered['excluded'],
        'result_count' => count($filtered['results']),
    ];
    if (!$filtered['results']) {
        flash('ok', 'All pasted sites already exist in old inventory (' . $filtered['excluded'] . ' excluded).');
    } else {
        flash(
            'ok',
            'Filtered: ' . count($filtered['results']) . ' new site(s). Excluded '
            . $filtered['excluded'] . ' already in inventory.'
        );
    }
    redirect('/inventory');
}

function ops_inventory_add(): void
{
    verify_csrf();
    $user = require_login();
    $results = $_SESSION['inventory_results'] ?? [];
    if (!is_array($results) || !$results) {
        // Fallback: accept posted list
        $results = parse_site_list((string) ($_POST['results'] ?? ''));
    }
    if (!$results) {
        flash('error', 'No filtered results to add. Run Filter sites first.');
        redirect('/inventory');
    }
    $out = add_sites_to_inventory($results, (string) ($user['id'] ?? null));
    unset($_SESSION['inventory_results'], $_SESSION['inventory_filter_meta'], $_SESSION['inventory_new_raw']);
    flash(
        'ok',
        'Added ' . $out['added'] . ' site(s) to old inventory'
        . ($out['skipped'] ? ' (' . $out['skipped'] . ' already present)' : '') . '.'
    );
    redirect('/inventory');
}

function ops_inventory_admin_add(): void
{
    verify_csrf();
    $user = require_admin();
    $raw = (string) ($_POST['admin_sites'] ?? '');
    $parsed = parse_site_list($raw);
    if (!$parsed) {
        flash('error', 'Enter at least one site to add to inventory.');
        redirect('/inventory');
    }
    $out = add_sites_to_inventory($parsed, (string) ($user['id'] ?? null));
    flash(
        'ok',
        'Admin added ' . $out['added'] . ' site(s)'
        . ($out['skipped'] ? ' (' . $out['skipped'] . ' duplicates skipped)' : '') . '.'
    );
    redirect('/inventory');
}

function ops_team(): void
{
    require_admin();
    render('team', [
        'title' => 'Team',
        'users' => list_users(),
    ]);
}

function ops_team_save(): void
{
    verify_csrf();
    require_admin();
    $email = strtolower(trim((string) ($_POST['email'] ?? '')));
    $name = trim((string) ($_POST['full_name'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    $role = (string) ($_POST['role'] ?? 'staff');
    if ($email === '' || $name === '' || strlen($password) < 6) {
        flash('error', 'Name, email, password (6+) required.');
        redirect('/team');
    }
    try {
        db()->prepare(
            'INSERT INTO users (id, email, full_name, role, active, password_hash, created_at) VALUES (?, ?, ?, ?, 1, ?, ?)'
        )->execute([
            new_id('user'),
            $email,
            $name,
            in_array($role, ['admin', 'staff'], true) ? $role : 'staff',
            password_hash($password, PASSWORD_DEFAULT),
            date('c'),
        ]);
        flash('ok', 'User added.');
    } catch (Throwable) {
        flash('error', 'Email already exists.');
    }
    redirect('/team');
}

function ops_team_update(): void
{
    verify_csrf();
    require_admin();
    $id = (string) ($_POST['id'] ?? '');
    db()->prepare('UPDATE users SET full_name=?, role=?, active=? WHERE id=?')->execute([
        trim((string) ($_POST['full_name'] ?? '')),
        in_array((string) ($_POST['role'] ?? ''), ['admin', 'staff'], true) ? $_POST['role'] : 'staff',
        isset($_POST['active']) ? 1 : 0,
        $id,
    ]);
    $password = (string) ($_POST['password'] ?? '');
    if ($password !== '') {
        if (strlen($password) < 6) {
            flash('error', 'Password must be 6+ characters.');
            redirect('/team');
        }
        db()->prepare('UPDATE users SET password_hash=? WHERE id=?')
            ->execute([password_hash($password, PASSWORD_DEFAULT), $id]);
    }
    flash('ok', 'User updated.');
    redirect('/team');
}
