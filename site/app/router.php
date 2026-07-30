<?php

declare(strict_types=1);

function dispatch(): void
{
    $path = request_path();
    if ($path === '/') {
        $path = '';
    }
    $path = trim($path, '/');
    $segments = $path === '' ? [] : explode('/', $path);

    // Static-ish routes
    if ($path === '' && !is_post()) {
        render('pages/home', ['title' => null]);
        return;
    }

    $routes = [
        'GET' => [
            'services' => fn () => render('pages/services', ['title' => 'Services']),
            'software' => fn () => render('pages/software', ['title' => 'Software']),
            'about' => function () {
                $members = db()->query('SELECT * FROM team_members ORDER BY sort_order')->fetchAll();
                $groups = [];
                foreach ($members as $m) {
                    $groups[$m['group_key']]['label'] = $m['group_label'];
                    $groups[$m['group_key']]['members'][] = $m;
                }
                render('pages/about', ['title' => 'About', 'groups' => $groups]);
            },
            'contact' => fn () => render('pages/contact', [
                'title' => 'Contact',
                'contact' => app_config()['contact'],
            ]),
            'blog' => function () {
                $all = db()->query('SELECT * FROM posts ORDER BY published_at DESC')->fetchAll();
                $posts = array_values(array_filter(
                    $all,
                    fn ($p) => !empty($p['published_at']) && strtotime((string) $p['published_at']) <= time()
                ));
                render('blog/index', ['title' => 'Blog', 'posts' => $posts]);
            },
            'login' => function () {
                if (current_user()) {
                    redirect('/staff');
                }
                render('auth/login', ['title' => 'Staff login']);
            },
            'staff' => function () {
                $user = require_login();
                render('staff/index', [
                    'title' => 'Staff tools',
                    'user' => $user,
                    'tools' => [
                        [
                            'name' => 'Attendance',
                            'url' => app_config()['tools']['attendance'],
                            'blurb' => 'Staff check-in / check-out, leave, holidays, and admin timings.',
                            'note' => 'Plain PHP + MySQL on Hostinger; checkout rules + half leave built in.',
                        ],
                        [
                            'name' => 'Ops / Link Desk',
                            'url' => app_config()['tools']['ops'],
                            'blurb' => 'Clients, link inventory, monthly P&L, and CSV import — replaces the Excel sheet.',
                            'note' => 'Plain PHP + MySQL on Hostinger (same stack as this site).',
                        ],
                    ],
                ]);
            },
            'admin' => fn () => redirect('/admin/posts'),
            'admin/posts' => 'admin_posts_index',
            'admin/posts/create' => 'admin_posts_form',
            'admin/team' => 'admin_team_index',
            'admin/team/create' => 'admin_team_form',
            'admin/inquiries' => 'admin_inquiries_index',
        ],
        'POST' => [
            'contact' => 'contact_store',
            'login' => 'login_store',
            'logout' => 'logout_store',
            'admin/posts' => 'admin_posts_store',
            'admin/team' => 'admin_team_store',
        ],
    ];

    // Dynamic GET blog/{slug}
    if (!is_post() && ($segments[0] ?? '') === 'blog' && isset($segments[1]) && !isset($segments[2])) {
        $stmt = db()->prepare('SELECT * FROM posts WHERE slug = ? LIMIT 1');
        $stmt->execute([$segments[1]]);
        $post = $stmt->fetch();
        if (!$post || !$post['published_at'] || strtotime($post['published_at']) > time()) {
            http_response_code(404);
            render('pages/404', ['title' => 'Not found']);
            return;
        }
        render('blog/show', ['title' => $post['title'], 'post' => $post]);
        return;
    }

    // Dynamic admin routes
    if (($segments[0] ?? '') === 'admin') {
        require_admin();
        if (($segments[1] ?? '') === 'posts' && isset($segments[2])) {
            if ($segments[2] === 'create' && !is_post()) {
                render('admin/post_form', ['title' => 'New post', 'post' => null, 'layout' => 'admin']);
                return;
            }
            if (is_numeric($segments[2]) && ($segments[3] ?? '') === 'edit' && !is_post()) {
                $stmt = db()->prepare('SELECT * FROM posts WHERE id = ?');
                $stmt->execute([(int) $segments[2]]);
                $post = $stmt->fetch();
                if (!$post) {
                    http_response_code(404);
                    exit('Not found');
                }
                render('admin/post_form', ['title' => 'Edit post', 'post' => $post, 'layout' => 'admin']);
                return;
            }
            if (is_numeric($segments[2]) && is_post() && ($segments[3] ?? '') === 'update') {
                admin_posts_update((int) $segments[2]);
                return;
            }
            if (is_numeric($segments[2]) && is_post() && ($segments[3] ?? '') === 'delete') {
                verify_csrf();
                db()->prepare('DELETE FROM posts WHERE id = ?')->execute([(int) $segments[2]]);
                flash('success', 'Post deleted.');
                redirect('/admin/posts');
            }
        }
        if (($segments[1] ?? '') === 'team' && isset($segments[2])) {
            if ($segments[2] === 'create' && !is_post()) {
                render('admin/team_form', ['title' => 'Add member', 'member' => null, 'layout' => 'admin']);
                return;
            }
            if (is_numeric($segments[2]) && ($segments[3] ?? '') === 'edit' && !is_post()) {
                $stmt = db()->prepare('SELECT * FROM team_members WHERE id = ?');
                $stmt->execute([(int) $segments[2]]);
                $member = $stmt->fetch();
                if (!$member) {
                    exit('Not found');
                }
                render('admin/team_form', ['title' => 'Edit member', 'member' => $member, 'layout' => 'admin']);
                return;
            }
            if (is_numeric($segments[2]) && is_post() && ($segments[3] ?? '') === 'update') {
                admin_team_update((int) $segments[2]);
                return;
            }
            if (is_numeric($segments[2]) && is_post() && ($segments[3] ?? '') === 'delete') {
                verify_csrf();
                db()->prepare('DELETE FROM team_members WHERE id = ?')->execute([(int) $segments[2]]);
                flash('success', 'Member removed.');
                redirect('/admin/team');
            }
        }
        if (($segments[1] ?? '') === 'inquiries') {
            if (!isset($segments[2]) && !is_post()) {
                $rows = db()->query('SELECT * FROM contact_inquiries ORDER BY id DESC')->fetchAll();
                render('admin/inquiries', ['title' => 'Inquiries', 'inquiries' => $rows, 'layout' => 'admin']);
                return;
            }
            if (is_numeric($segments[2] ?? null) && ($segments[3] ?? '') === '' && !is_post()) {
                $stmt = db()->prepare('SELECT * FROM contact_inquiries WHERE id = ?');
                $stmt->execute([(int) $segments[2]]);
                $inquiry = $stmt->fetch();
                if (!$inquiry) {
                    exit('Not found');
                }
                render('admin/inquiry_show', ['title' => 'Inquiry', 'inquiry' => $inquiry, 'layout' => 'admin']);
                return;
            }
            if (is_numeric($segments[2] ?? null) && is_post() && ($segments[3] ?? '') === 'delete') {
                verify_csrf();
                db()->prepare('DELETE FROM contact_inquiries WHERE id = ?')->execute([(int) $segments[2]]);
                flash('success', 'Inquiry deleted.');
                redirect('/admin/inquiries');
            }
        }
        if (($segments[1] ?? '') === 'posts' && !isset($segments[2]) && !is_post()) {
            $posts = db()->query('SELECT * FROM posts ORDER BY id DESC')->fetchAll();
            render('admin/posts', ['title' => 'Posts', 'posts' => $posts, 'layout' => 'admin']);
            return;
        }
        if (($segments[1] ?? '') === 'team' && !isset($segments[2]) && !is_post()) {
            $members = db()->query('SELECT * FROM team_members ORDER BY sort_order')->fetchAll();
            render('admin/team', ['title' => 'Team', 'members' => $members, 'layout' => 'admin']);
            return;
        }
        if (($segments[1] ?? '') === 'posts' && !isset($segments[2]) && is_post()) {
            admin_posts_store();
            return;
        }
        if (($segments[1] ?? '') === 'team' && !isset($segments[2]) && is_post()) {
            admin_team_store();
            return;
        }
    }

    // Simple named handlers
    if ($path === 'contact' && is_post()) {
        contact_store();
        return;
    }
    if ($path === 'login' && is_post()) {
        login_store();
        return;
    }
    if ($path === 'logout' && is_post()) {
        verify_csrf();
        logout_user();
        redirect('/');
    }

    if (isset($routes['GET'][$path]) && !is_post()) {
        $handler = $routes['GET'][$path];
        if (is_callable($handler)) {
            $handler();
            return;
        }
    }

    http_response_code(404);
    render('pages/404', ['title' => 'Not found']);
}

function contact_store(): void
{
    verify_csrf();
    $name = trim((string) ($_POST['name'] ?? ''));
    $email = trim((string) ($_POST['email'] ?? ''));
    $message = trim((string) ($_POST['message'] ?? ''));
    if ($name === '' || $email === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        flash('error', 'Please fill name, valid email, and message.');
        redirect('/contact');
    }
    db()->prepare('INSERT INTO contact_inquiries (name, email, company, phone, interest, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        ->execute([
            $name,
            $email,
            trim((string) ($_POST['company'] ?? '')) ?: null,
            trim((string) ($_POST['phone'] ?? '')) ?: null,
            trim((string) ($_POST['interest'] ?? '')) ?: null,
            $message,
            date('c'),
        ]);
    flash('success', 'Thanks — we received your message and will reply within 1 business day.');
    redirect('/contact');
}

function login_store(): void
{
    verify_csrf();
    $email = (string) ($_POST['email'] ?? '');
    $password = (string) ($_POST['password'] ?? '');
    if (!attempt_login($email, $password)) {
        flash('error', 'Invalid email or password.');
        redirect('/login');
    }
    redirect('/staff');
}

function admin_posts_store(): void
{
    verify_csrf();
    require_admin();
    $title = trim((string) ($_POST['title'] ?? ''));
    $body = trim((string) ($_POST['body'] ?? ''));
    if ($title === '' || $body === '') {
        flash('error', 'Title and body required.');
        redirect('/admin/posts/create');
    }
    $slug = slugify((string) ($_POST['slug'] ?? $title));
    $published = trim((string) ($_POST['published_at'] ?? ''));
    $now = date('c');
    db()->prepare('INSERT INTO posts (title, slug, excerpt, body, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        ->execute([
            $title,
            $slug,
            trim((string) ($_POST['excerpt'] ?? '')) ?: null,
            $body,
            $published !== '' ? date('c', strtotime($published)) : null,
            $now,
            $now,
        ]);
    flash('success', 'Post created.');
    redirect('/admin/posts');
}

function admin_posts_update(int $id): void
{
    verify_csrf();
    require_admin();
    $title = trim((string) ($_POST['title'] ?? ''));
    $body = trim((string) ($_POST['body'] ?? ''));
    $slug = slugify((string) ($_POST['slug'] ?? $title));
    $published = trim((string) ($_POST['published_at'] ?? ''));
    db()->prepare('UPDATE posts SET title=?, slug=?, excerpt=?, body=?, published_at=?, updated_at=? WHERE id=?')
        ->execute([
            $title,
            $slug,
            trim((string) ($_POST['excerpt'] ?? '')) ?: null,
            $body,
            $published !== '' ? date('c', strtotime($published)) : null,
            date('c'),
            $id,
        ]);
    flash('success', 'Post updated.');
    redirect('/admin/posts');
}

function admin_team_store(): void
{
    verify_csrf();
    require_admin();
    db()->prepare('INSERT INTO team_members (name, role, group_key, group_label, photo, sort_order) VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([
            trim((string) $_POST['name']),
            trim((string) $_POST['role']),
            trim((string) $_POST['group_key']),
            trim((string) $_POST['group_label']),
            trim((string) ($_POST['photo'] ?? '')) ?: null,
            (int) ($_POST['sort_order'] ?? 0),
        ]);
    flash('success', 'Team member added.');
    redirect('/admin/team');
}

function admin_team_update(int $id): void
{
    verify_csrf();
    require_admin();
    db()->prepare('UPDATE team_members SET name=?, role=?, group_key=?, group_label=?, photo=?, sort_order=? WHERE id=?')
        ->execute([
            trim((string) $_POST['name']),
            trim((string) $_POST['role']),
            trim((string) $_POST['group_key']),
            trim((string) $_POST['group_label']),
            trim((string) ($_POST['photo'] ?? '')) ?: null,
            (int) ($_POST['sort_order'] ?? 0),
            $id,
        ]);
    flash('success', 'Team member updated.');
    redirect('/admin/team');
}
