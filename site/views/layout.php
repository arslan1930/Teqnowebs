<?php
$layout = $layout ?? 'site';
$titleFull = !empty($title)
    ? e($title) . ' · Teqnowebs'
    : 'Teqnowebs — Web, Design, SEO & Business Software';
$meta = $meta_description ?? 'Teqnowebs builds websites, UI/UX, graphic design, SEO, link building, and custom software.';
?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= $titleFull ?></title>
  <meta name="description" content="<?= e($meta) ?>">
  <link rel="icon" href="<?= e(url('/favicon.ico')) ?>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= e(url('/assets/css/app.css')) ?>">
</head>
<body>
<?php if ($layout === 'admin'): ?>
  <?php require __DIR__ . '/partials/admin_nav.php'; ?>
  <main class="wrap" style="padding-top:2rem;padding-bottom:3rem;">
    <?php if ($msg = flash('success')): ?><div class="alert alert-ok"><?= e($msg) ?></div><?php endif; ?>
    <?php if ($msg = flash('error')): ?><div class="alert alert-err"><?= e($msg) ?></div><?php endif; ?>
    <?php require __DIR__ . '/' . $content_view . '.php'; ?>
  </main>
<?php else: ?>
  <?php require __DIR__ . '/partials/header.php'; ?>
  <main>
    <?php require __DIR__ . '/' . $content_view . '.php'; ?>
  </main>
  <?php require __DIR__ . '/partials/footer.php'; ?>
<?php endif; ?>
</body>
</html>
