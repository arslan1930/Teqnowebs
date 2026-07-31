<?php
/** @var array $config */
/** @var string $content_view */
/** @var string|null $title */
/** @var array|null $user */
$user = $user ?? current_user();
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
          <div class="brand">Teqnowebs Ops</div>
          <div class="muted small"><?= e($user['full_name']) ?> · <?= e($user['role']) ?></div>
        </div>
        <div class="nav">
          <?php
          $links = [
              'home' => 'Home',
              'clients' => 'Clients',
              'tasks' => 'Tasks',
              'pnl' => 'P&L',
              'import' => 'Import',
          ];
          if (($user['role'] ?? '') === 'admin') {
              $links['team'] = 'Team';
          }
          foreach ($links as $href => $label):
          ?>
            <a class="<?= ($content_view ?? '') === $href ? 'active' : '' ?>" href="<?= e(url('/' . $href)) ?>"><?= e($label) ?></a>
          <?php endforeach; ?>
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
