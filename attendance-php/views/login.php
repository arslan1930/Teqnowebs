<div class="login-box panel">
  <p class="muted small" style="letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:var(--accent);">Teqnowebs</p>
  <h1>Attendance</h1>
  <p class="muted">Plain PHP + MySQL for Hostinger. Seed password: <code>attendance123</code></p>
  <?php if (!empty($not_found)): ?>
    <p class="flash flash-error">Page not found.</p>
  <?php endif; ?>
  <form method="post" action="<?= e(url('/login')) ?>">
    <?= csrf_field() ?>
    <label for="email">Email</label>
    <input id="email" name="email" type="email" required autocomplete="username" value="staff@teqnowebs.com">
    <label for="password">Password</label>
    <input id="password" name="password" type="password" required autocomplete="current-password" value="attendance123">
    <div class="actions">
      <button class="cta" type="submit">Sign in</button>
    </div>
  </form>
  <p class="muted small" style="margin-top:1rem;">Admin: admin@teqnowebs.com · Staff: staff@teqnowebs.com</p>
</div>
