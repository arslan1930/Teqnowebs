<?php
/** @var array $config */
/** @var string $content_view */
/** @var string|null $title */
/** @var array|null $user */
?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e(($title ?? '') ? ($title . ' · ') : '') ?><?= e($config['app_name']) ?></title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= e(url('/assets/css/app.css')) ?>">
</head>
<body class="atmosphere">
  <div class="wrap">
    <?php if ($user): ?>
      <div class="topbar">
        <div>
          <div class="brand">Teqnowebs Attendance</div>
          <div class="muted small"><?= e($user['full_name']) ?> · <?= e($user['role']) ?></div>
        </div>
        <div class="nav">
          <?php if (($user['role'] ?? '') === 'admin'): ?>
            <a class="<?= ($content_view ?? '') === 'admin' ? 'active' : '' ?>" href="<?= e(url('/admin')) ?>">Admin</a>
          <?php else: ?>
            <a class="<?= ($content_view ?? '') === 'dashboard' ? 'active' : '' ?>" href="<?= e(url('/dashboard')) ?>">Dashboard</a>
          <?php endif; ?>
          <form class="inline" method="post" action="<?= e(url('/logout')) ?>">
            <?= csrf_field() ?>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </div>
    <?php endif; ?>

    <?php if ($msg = flash('error')): ?>
      <div class="flash flash-error"><?= e($msg) ?></div>
    <?php endif; ?>
    <?php if ($msg = flash('ok')): ?>
      <div class="flash flash-ok"><?= e($msg) ?></div>
    <?php endif; ?>

    <?php require __DIR__ . '/' . $content_view . '.php'; ?>
  </div>
</body>
</html>
