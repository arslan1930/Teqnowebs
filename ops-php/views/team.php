<div class="panel">
  <h1>Team</h1>
  <p class="muted">Ops users (seed password: ops123).</p>
</div>
<div class="panel">
  <h2>Add user</h2>
  <form method="post" action="<?= e(url('/team/save')) ?>" class="row row-2">
    <?= csrf_field() ?>
    <div><label>Name</label><input name="full_name" required></div>
    <div><label>Email</label><input type="email" name="email" required></div>
    <div><label>Password</label><input name="password" required minlength="6" value="ops123"></div>
    <div>
      <label>Role</label>
      <select name="role"><option value="staff">Staff</option><option value="admin">Admin</option></select>
    </div>
    <div class="actions"><button class="cta" type="submit">Add</button></div>
  </form>
</div>
<div class="panel">
  <h2>Users</h2>
  <?php foreach ($users as $u): ?>
    <form method="post" action="<?= e(url('/team/update')) ?>" class="row row-3" style="margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--line);">
      <?= csrf_field() ?>
      <input type="hidden" name="id" value="<?= e($u['id']) ?>">
      <div><label>Name</label><input name="full_name" value="<?= e($u['full_name']) ?>"></div>
      <div><label>Email</label><input value="<?= e($u['email']) ?>" disabled></div>
      <div>
        <label>Role</label>
        <select name="role">
          <option value="staff" <?= $u['role'] === 'staff' ? 'selected' : '' ?>>Staff</option>
          <option value="admin" <?= $u['role'] === 'admin' ? 'selected' : '' ?>>Admin</option>
        </select>
      </div>
      <div><label>New password</label><input name="password" placeholder="leave blank to keep"></div>
      <div style="display:flex;align-items:end;gap:.5rem;">
        <label style="display:flex;align-items:center;gap:.35rem;margin:0;">
          <input type="checkbox" name="active" style="width:auto" <?= (int) $u['active'] ? 'checked' : '' ?>> Active
        </label>
        <button class="btn-outline" type="submit">Save</button>
      </div>
    </form>
  <?php endforeach; ?>
</div>
