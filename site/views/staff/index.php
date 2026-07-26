<div style="padding-top:6rem;">
  <section class="atmosphere section" style="border:0;">
    <div class="wrap">
      <p class="eyebrow">Staff hub</p>
      <h1 class="font-display" style="font-size:2.25rem;">Internal tools</h1>
      <p class="muted">Signed in as <?= e($user['name']) ?>. These apps run on their own subdomains.</p>
      <div style="margin-top:1rem;display:flex;flex-wrap:wrap;gap:.5rem;">
        <?php if ((int) $user['is_admin']): ?>
          <a class="btn-outline" href="<?= e(url('/admin/posts')) ?>">Site admin</a>
        <?php endif; ?>
        <form method="post" action="<?= e(url('/logout')) ?>" style="margin:0;">
          <?= csrf_field() ?>
          <button class="btn-outline" type="submit">Sign out</button>
        </form>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="wrap grid-2">
      <?php foreach ($tools as $tool): ?>
        <a class="card-soft" href="<?= e($tool['url']) ?>" target="_blank" rel="noopener">
          <h2 class="font-display" style="margin:0;font-size:1.25rem;"><?= e($tool['name']) ?></h2>
          <p class="muted" style="font-size:.875rem;"><?= e($tool['blurb']) ?></p>
          <p style="font-size:.75rem;color:var(--ink-soft);"><?= e($tool['note']) ?></p>
          <p class="accent" style="font-weight:600;font-size:.875rem;margin-bottom:0;">Open →</p>
        </a>
      <?php endforeach; ?>
    </div>
  </section>
</div>
