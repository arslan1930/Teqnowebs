<div style="padding-top:7rem;padding-bottom:4rem;">
  <div class="wrap" style="max-width:28rem;">
    <div class="card-soft">
      <h1 class="font-display" style="margin-top:0;">Staff login</h1>
      <p class="muted" style="font-size:.875rem;">Internal tools for Attendance and Ops.</p>
      <?php if (!empty($config['debug'])): ?>
        <p class="muted" style="font-size:.8rem;">
          Dev login: <?= e($config['users']['admin']['email']) ?> /
          <?= e($config['users']['admin']['password']) ?>
        </p>
      <?php endif; ?>
      <?php if ($msg = flash('error')): ?><div class="alert alert-err"><?= e($msg) ?></div><?php endif; ?>
      <form class="form" method="post" action="<?= e(url('/login')) ?>">
        <?= csrf_field() ?>
        <label>Email<input type="email" name="email" required value="<?= e($config['users']['admin']['email']) ?>"></label>
        <label>Password<input type="password" name="password" required></label>
        <button class="cta" type="submit">Sign in</button>
      </form>
    </div>
  </div>
</div>
