<?php

declare(strict_types=1);

function dispatch(): void
{
    $path = trim(request_path(), '/');
    $method = method();

    if ($path === '' || $path === 'index.php') {
        $user = current_user();
        redirect($user ? (($user['role'] ?? '') === 'admin' ? '/admin' : '/dashboard') : '/login');
    }

    if ($method === 'GET' && $path === 'login') {
        if (current_user()) {
            redirect('/');
        }
        render('login', ['title' => 'Sign in']);
        return;
    }

    if ($method === 'POST' && $path === 'login') {
        verify_csrf();
        $email = (string) ($_POST['email'] ?? '');
        $password = (string) ($_POST['password'] ?? '');
        if (attempt_login($email, $password)) {
            $user = current_user();
            redirect(($user['role'] ?? '') === 'admin' ? '/admin' : '/dashboard');
        }
        flash('error', 'Invalid email or password.');
        redirect('/login');
    }

    if ($method === 'POST' && $path === 'logout') {
        verify_csrf();
        logout_user();
        redirect('/login');
    }

    if ($method === 'GET' && $path === 'dashboard') {
        attendance_dashboard();
        return;
    }

    if ($method === 'POST' && $path === 'punch') {
        attendance_punch();
        return;
    }

    if ($method === 'POST' && $path === 'leave') {
        attendance_leave_request();
        return;
    }

    if ($method === 'GET' && $path === 'admin') {
        attendance_admin();
        return;
    }

    if ($method === 'POST' && str_starts_with($path, 'admin/')) {
        attendance_admin_post($path);
        return;
    }

    if ($method === 'GET' && $path === 'admin/export') {
        attendance_export_csv();
        return;
    }

    http_response_code(404);
    render('login', ['title' => 'Not found', 'not_found' => true]);
}

function attendance_dashboard(): void
{
    $user = require_login();
    if (($user['role'] ?? '') === 'admin') {
        redirect('/admin');
    }

    $settings = get_settings();
    $tz = $settings['timezone'];
    $today = today_date_str($tz);
    $events = list_events((string) $user['id']);
    $timing = timing_for_group((string) $user['staff_group']);
    $holiday = holiday_on_date($today);
    $leave = approved_leave_on_date((string) $user['id'], $today);
    $status = get_day_status($events, [
        'timezone' => $tz,
        'date_str' => $today,
        'timing' => $timing,
        'holiday' => $holiday,
        'leave' => $leave,
    ]);
    $leaves = list_leaves((string) $user['id']);
    $month = substr($today, 0, 7);
    $usedLeave = count(array_filter(
        $leaves,
        fn ($l) => in_array($l['status'], ['approved', 'pending'], true) && str_starts_with((string) $l['leave_date'], $month)
    ));

    render('dashboard', [
        'title' => 'Dashboard',
        'user' => $user,
        'status' => $status,
        'today' => $today,
        'timing' => $timing,
        'holiday' => $holiday,
        'leave' => $leave,
        'leaves' => array_slice($leaves, 0, 12),
        'used_leave' => $usedLeave,
        'tz' => $tz,
        'recent' => array_slice($events, 0, 10),
    ]);
}

function attendance_punch(): void
{
    verify_csrf();
    $user = require_login();
    if (($user['role'] ?? '') === 'admin') {
        flash('error', 'Admins do not mark attendance.');
        redirect('/admin');
    }

    $type = (string) ($_POST['type'] ?? '');
    if (!in_array($type, ['check_in', 'check_out'], true)) {
        flash('error', 'Invalid punch type.');
        redirect('/dashboard');
    }

    $settings = get_settings();
    $tz = $settings['timezone'];
    $today = today_date_str($tz);

    if (holiday_on_date($today)) {
        flash('error', 'Today is a company holiday — no attendance required.');
        redirect('/dashboard');
    }
    if (approved_leave_on_date((string) $user['id'], $today)) {
        flash('error', 'You are on approved leave today.');
        redirect('/dashboard');
    }

    $existing = list_events((string) $user['id']);
    $todays = events_on_date($existing, $today, $tz);

    if ($type === 'check_in' && array_filter($todays, fn ($e) => $e['type'] === 'check_in')) {
        flash('error', 'Already checked in today.');
        redirect('/dashboard');
    }
    if ($type === 'check_out') {
        if (!array_filter($todays, fn ($e) => $e['type'] === 'check_in')) {
            flash('error', 'Check in first before checking out.');
            redirect('/dashboard');
        }
        if (array_filter($todays, fn ($e) => $e['type'] === 'check_out')) {
            flash('error', 'Already checked out today.');
            redirect('/dashboard');
        }
        $blocked = checkout_blocked_reason(minutes_since_midnight(null, $tz));
        if ($blocked) {
            flash('error', $blocked);
            redirect('/dashboard');
        }
    }

    $note = trim((string) ($_POST['note'] ?? '')) ?: null;
    if ($type === 'check_out' && is_half_leave_checkout(minutes_since_midnight(null, $tz))) {
        $note = $note ? $note . ' · Half leave (checkout 3–4pm)' : 'Half leave (checkout 3–4pm)';
    }

    insert_event([
        'user_id' => $user['id'],
        'type' => $type,
        'note' => $note,
        'client_ip' => client_ip(),
    ]);

    flash('ok', $type === 'check_in' ? 'Checked in.' : 'Checked out.');
    redirect('/dashboard');
}

function attendance_leave_request(): void
{
    verify_csrf();
    $user = require_login();
    if (($user['role'] ?? '') !== 'staff') {
        flash('error', 'Only staff can request personal leave.');
        redirect('/dashboard');
    }

    $date = trim((string) ($_POST['date'] ?? ''));
    $reason = trim((string) ($_POST['reason'] ?? '')) ?: null;
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        flash('error', 'Date required.');
        redirect('/dashboard');
    }

    $month = substr($date, 0, 7);
    $stmt = db()->prepare(
        "SELECT COUNT(*) FROM leave_requests
         WHERE user_id = ? AND status IN ('approved','pending') AND leave_date LIKE ?"
    );
    $stmt->execute([$user['id'], $month . '%']);
    if ((int) $stmt->fetchColumn() >= 1) {
        flash('error', 'Only 1 personal leave is allowed per month.');
        redirect('/dashboard');
    }

    try {
        db()->prepare(
            "INSERT INTO leave_requests (id, user_id, leave_date, reason, status, created_at)
             VALUES (?, ?, ?, ?, 'pending', ?)"
        )->execute([new_id('leave'), $user['id'], $date, $reason, date('c')]);
        flash('ok', 'Leave request submitted.');
    } catch (Throwable) {
        flash('error', 'You already have a leave request for that date.');
    }
    redirect('/dashboard');
}

function attendance_admin(): void
{
    $admin = require_admin();
    $tab = (string) ($_GET['tab'] ?? 'roster');
    $settings = get_settings();
    $tz = $settings['timezone'];
    $today = today_date_str($tz);

    $staff = list_attendance_staff();
    $events = list_events();
    $holidays = list_holidays();
    $leaves = list_leaves();
    $timings = list_timings();
    $profiles = list_staff_profiles();

    $roster = [];
    $holidayToday = holiday_on_date($today);
    foreach ($staff as $profile) {
        $timing = timing_for_group((string) $profile['staff_group']);
        $userEvents = array_values(array_filter($events, fn ($e) => $e['user_id'] === $profile['id']));
        $leave = approved_leave_on_date((string) $profile['id'], $today);
        $status = get_day_status($userEvents, [
            'timezone' => $tz,
            'date_str' => $today,
            'timing' => $timing,
            'holiday' => $holidayToday,
            'leave' => $leave,
        ]);
        $roster[] = [
            'profile' => $profile,
            'status' => $status,
            'on_leave' => (bool) $leave,
            'is_holiday' => (bool) $holidayToday,
        ];
    }

    $from = (string) ($_GET['from'] ?? add_days($today, -14));
    $to = (string) ($_GET['to'] ?? $today);
    $filterUser = (string) ($_GET['user_id'] ?? '');
    $report = build_day_rows($profiles, $events, $holidays, $leaves, $timings, $from, $to, $tz, $filterUser ?: null);

    render('admin', [
        'title' => 'Admin',
        'admin' => $admin,
        'tab' => $tab,
        'roster' => $roster,
        'today' => $today,
        'tz' => $tz,
        'settings' => $settings,
        'timings' => $timings,
        'holidays' => $holidays,
        'leaves' => $leaves,
        'profiles' => $profiles,
        'report' => $report,
        'from' => $from,
        'to' => $to,
        'filter_user' => $filterUser,
    ]);
}

function build_day_rows(
    array $profiles,
    array $events,
    array $holidays,
    array $leaves,
    array $timings,
    string $from,
    string $to,
    string $tz,
    ?string $userId
): array {
    $profiles = array_values(array_filter(
        $profiles,
        fn ($p) => ($p['role'] ?? '') === 'staff' && (int) $p['active'] === 1 && ($userId === null || $p['id'] === $userId)
    ));
    $holidayMap = [];
    foreach ($holidays as $h) {
        $holidayMap[$h['holiday_date']] = $h;
    }
    $rows = [];
    foreach ($profiles as $profile) {
        $timing = null;
        foreach ($timings as $t) {
            if ($t['staff_group'] === $profile['staff_group']) {
                $timing = $t;
                break;
            }
        }
        $userEvents = array_values(array_filter($events, fn ($e) => $e['user_id'] === $profile['id']));
        $userLeaves = array_values(array_filter($leaves, fn ($l) => $l['user_id'] === $profile['id']));
        foreach (each_date_inclusive($from, $to) as $date) {
            $leave = null;
            foreach ($userLeaves as $l) {
                if ($l['leave_date'] === $date && $l['status'] === 'approved') {
                    $leave = $l;
                    break;
                }
            }
            $status = get_day_status($userEvents, [
                'timezone' => $tz,
                'date_str' => $date,
                'timing' => $timing,
                'holiday' => $holidayMap[$date] ?? null,
                'leave' => $leave,
            ]);
            $rows[] = [
                'date' => $date,
                'user_id' => $profile['id'],
                'user_name' => $profile['full_name'],
                'staff_group' => $profile['staff_group'],
                'check_in_at' => $status['check_in']['created_at'] ?? null,
                'check_out_at' => $status['check_out']['created_at'] ?? null,
                'status' => $status['punch_status'],
                'half_leave' => $status['punch_status'] === 'half_leave',
                'note' => trim(implode(' · ', array_filter([
                    $status['check_in']['note'] ?? null,
                    $status['check_out']['note'] ?? null,
                ]))) ?: null,
            ];
        }
    }
    usort($rows, function ($a, $b) {
        if ($a['date'] === $b['date']) {
            return strcmp((string) $a['user_name'], (string) $b['user_name']);
        }
        return strcmp((string) $b['date'], (string) $a['date']);
    });
    return $rows;
}

function attendance_admin_post(string $path): void
{
    verify_csrf();
    require_admin();

    try {
        match ($path) {
            'admin/staff' => admin_add_staff(),
            'admin/staff-update' => admin_update_staff(),
            'admin/password' => admin_reset_password(),
            'admin/timing' => admin_save_timing(),
            'admin/holiday' => admin_add_holiday(),
            'admin/holiday-delete' => admin_delete_holiday(),
            'admin/leave-review' => admin_review_leave(),
            'admin/settings' => admin_save_settings(),
            'admin/manual-day' => admin_manual_day(),
            default => throw new RuntimeException('Unknown action'),
        };
    } catch (Throwable $e) {
        flash('error', $e->getMessage());
    }
    $tab = (string) ($_POST['tab'] ?? 'roster');
    redirect('/admin?tab=' . urlencode($tab));
}

function admin_add_staff(): void
{
    $role = (string) ($_POST['role'] ?? 'staff');
    if ($role === 'staff') {
        $c = (int) db()->query("SELECT COUNT(*) FROM staff_profiles WHERE role='staff'")->fetchColumn();
        if ($c >= 15) {
            throw new RuntimeException('Seat limit reached (15 staff)');
        }
    }
    $email = strtolower(trim((string) ($_POST['email'] ?? '')));
    $name = trim((string) ($_POST['full_name'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    $group = (string) ($_POST['staff_group'] ?? 'male');
    if ($email === '' || $name === '' || strlen($password) < 6) {
        throw new RuntimeException('Name, email, and password (6+ chars) required.');
    }
    if (!in_array($group, ['female', 'male'], true)) {
        $group = 'male';
    }
    try {
        db()->prepare(
            'INSERT INTO staff_profiles (id, email, full_name, role, staff_group, active, password_hash, created_at)
             VALUES (?, ?, ?, ?, ?, 1, ?, ?)'
        )->execute([
            new_id('user'),
            $email,
            $name,
            in_array($role, ['admin', 'staff'], true) ? $role : 'staff',
            $group,
            password_hash($password, PASSWORD_DEFAULT),
            date('c'),
        ]);
        flash('ok', 'Staff member added.');
    } catch (Throwable) {
        throw new RuntimeException('A staff member with that email already exists.');
    }
}

function admin_update_staff(): void
{
    $id = (string) ($_POST['id'] ?? '');
    $active = isset($_POST['active']) ? 1 : 0;
    $group = (string) ($_POST['staff_group'] ?? 'male');
    $role = (string) ($_POST['role'] ?? 'staff');
    $name = trim((string) ($_POST['full_name'] ?? ''));
    db()->prepare(
        'UPDATE staff_profiles SET full_name=?, role=?, staff_group=?, active=? WHERE id=?'
    )->execute([
        $name,
        in_array($role, ['admin', 'staff'], true) ? $role : 'staff',
        in_array($group, ['female', 'male'], true) ? $group : 'male',
        $active,
        $id,
    ]);
    flash('ok', 'Staff updated.');
}

function admin_reset_password(): void
{
    $id = (string) ($_POST['id'] ?? '');
    $password = (string) ($_POST['password'] ?? '');
    if (strlen($password) < 6) {
        throw new RuntimeException('Password must be at least 6 characters.');
    }
    db()->prepare('UPDATE staff_profiles SET password_hash=? WHERE id=?')
        ->execute([password_hash($password, PASSWORD_DEFAULT), $id]);
    flash('ok', 'Password reset.');
}

function admin_save_timing(): void
{
    $group = (string) ($_POST['staff_group'] ?? '');
    $start = (string) ($_POST['start_time'] ?? '09:00');
    $end = (string) ($_POST['end_time'] ?? '17:00');
    $late = (int) ($_POST['late_after_minutes'] ?? 15);
    if (!in_array($group, ['female', 'male'], true)) {
        throw new RuntimeException('Invalid group');
    }
    $driver = db()->getAttribute(PDO::ATTR_DRIVER_NAME);
    if ($driver === 'mysql') {
        db()->prepare(
            'INSERT INTO office_timings (staff_group, start_time, end_time, late_after_minutes) VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE start_time=VALUES(start_time), end_time=VALUES(end_time), late_after_minutes=VALUES(late_after_minutes)'
        )->execute([$group, $start, $end, $late]);
    } else {
        db()->prepare(
            'INSERT INTO office_timings (staff_group, start_time, end_time, late_after_minutes) VALUES (?, ?, ?, ?)
             ON CONFLICT(staff_group) DO UPDATE SET start_time=excluded.start_time, end_time=excluded.end_time, late_after_minutes=excluded.late_after_minutes'
        )->execute([$group, $start, $end, $late]);
    }
    flash('ok', 'Timing saved.');
}

function admin_add_holiday(): void
{
    $date = (string) ($_POST['date'] ?? '');
    $title = trim((string) ($_POST['title'] ?? ''));
    $note = trim((string) ($_POST['note'] ?? '')) ?: null;
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || $title === '') {
        throw new RuntimeException('Date and title required.');
    }
    try {
        db()->prepare(
            'INSERT INTO company_holidays (id, holiday_date, title, note, created_at) VALUES (?, ?, ?, ?, ?)'
        )->execute([new_id('hol'), $date, $title, $note, date('c')]);
        flash('ok', 'Holiday added.');
    } catch (Throwable) {
        throw new RuntimeException('A holiday is already announced for that date.');
    }
}

function admin_delete_holiday(): void
{
    db()->prepare('DELETE FROM company_holidays WHERE id = ?')->execute([(string) ($_POST['id'] ?? '')]);
    flash('ok', 'Holiday removed.');
}

function admin_review_leave(): void
{
    $id = (string) ($_POST['id'] ?? '');
    $status = (string) ($_POST['status'] ?? '');
    if (!in_array($status, ['approved', 'rejected'], true)) {
        throw new RuntimeException('Invalid review.');
    }
    $stmt = db()->prepare('SELECT * FROM leave_requests WHERE id = ?');
    $stmt->execute([$id]);
    $current = $stmt->fetch();
    if (!$current) {
        throw new RuntimeException('Leave request not found.');
    }
    if ($status === 'approved') {
        $month = substr((string) $current['leave_date'], 0, 7);
        $chk = db()->prepare(
            "SELECT COUNT(*) FROM leave_requests
             WHERE user_id = ? AND status = 'approved' AND leave_date LIKE ? AND id != ?"
        );
        $chk->execute([$current['user_id'], $month . '%', $id]);
        if ((int) $chk->fetchColumn() >= 1) {
            throw new RuntimeException('This staff member already has 1 approved leave this month.');
        }
    }
    db()->prepare('UPDATE leave_requests SET status = ? WHERE id = ?')->execute([$status, $id]);
    flash('ok', 'Leave ' . $status . '.');
}

function admin_save_settings(): void
{
    $tz = trim((string) ($_POST['timezone'] ?? 'Asia/Karachi')) ?: 'Asia/Karachi';
    $raw = (string) ($_POST['allowed_ips'] ?? '');
    $ips = preg_split('/[\r\n,]+/', $raw) ?: [];
    save_settings($tz, $ips);
    flash('ok', 'Settings saved. IP list is stored for admin reference (enforce via Hostinger / .htaccess if needed).');
}

function admin_manual_day(): void
{
    $userId = (string) ($_POST['user_id'] ?? '');
    $date = (string) ($_POST['date'] ?? '');
    $checkIn = trim((string) ($_POST['check_in'] ?? ''));
    $checkOut = trim((string) ($_POST['check_out'] ?? ''));
    $note = trim((string) ($_POST['note'] ?? '')) ?: 'Manual admin edit';
    $admin = current_user();
    $tz = get_settings()['timezone'];

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || $userId === '') {
        throw new RuntimeException('User and date required.');
    }

    $events = list_events($userId);
    foreach (events_on_date($events, $date, $tz) as $e) {
        db()->prepare('DELETE FROM attendance_events WHERE id = ?')->execute([$e['id']]);
    }

    if ($checkIn !== '') {
        $iso = (new DateTimeImmutable($date . 'T' . $checkIn . ':00', new DateTimeZone($tz)))->format('c');
        insert_event([
            'user_id' => $userId,
            'type' => 'check_in',
            'note' => $note,
            'is_manual' => true,
            'edited_by' => $admin['id'] ?? null,
            'created_at' => $iso,
        ]);
    }
    if ($checkOut !== '') {
        $iso = (new DateTimeImmutable($date . 'T' . $checkOut . ':00', new DateTimeZone($tz)))->format('c');
        insert_event([
            'user_id' => $userId,
            'type' => 'check_out',
            'note' => $note,
            'is_manual' => true,
            'edited_by' => $admin['id'] ?? null,
            'created_at' => $iso,
        ]);
    }
    flash('ok', 'Manual day saved.');
}

function attendance_export_csv(): void
{
    require_admin();
    $settings = get_settings();
    $tz = $settings['timezone'];
    $today = today_date_str($tz);
    $from = (string) ($_GET['from'] ?? add_days($today, -30));
    $to = (string) ($_GET['to'] ?? $today);
    $filterUser = (string) ($_GET['user_id'] ?? '');
    $rows = build_day_rows(
        list_staff_profiles(),
        list_events(),
        list_holidays(),
        list_leaves(),
        list_timings(),
        $from,
        $to,
        $tz,
        $filterUser ?: null
    );

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="attendance-' . $from . '-' . $to . '.csv"');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['date', 'name', 'group', 'status', 'half_leave', 'check_in', 'check_out', 'note']);
    foreach ($rows as $r) {
        fputcsv($out, [
            $r['date'],
            $r['user_name'],
            $r['staff_group'],
            $r['status'],
            $r['half_leave'] ? 'yes' : 'no',
            $r['check_in_at'] ?? '',
            $r['check_out_at'] ?? '',
            $r['note'] ?? '',
        ]);
    }
    fclose($out);
    exit;
}
