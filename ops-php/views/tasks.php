<div class="panel">
  <h1>Link tasks</h1>
  <form method="get" action="<?= e(url('/tasks')) ?>" class="row row-3">
    <div><label>Month</label><input type="month" name="month" value="<?= e($month) ?>"></div>
    <div>
      <label>Status</label>
      <select name="status">
        <option value="">All</option>
        <?php foreach (link_statuses() as $s): ?>
          <option value="<?= e($s) ?>" <?= $status === $s ? 'selected' : '' ?>><?= e(status_label($s)) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div>
      <label>Client</label>
      <select name="client_id">
        <option value="">All</option>
        <?php foreach ($clients as $c): ?>
          <option value="<?= e($c['id']) ?>" <?= $client_id === $c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="actions"><button class="btn-outline" type="submit">Filter</button></div>
  </form>
</div>

<div class="panel">
  <h2><?= $edit ? 'Edit task' : 'Add task' ?></h2>
  <form method="post" action="<?= e(url('/tasks/save')) ?>">
    <?= csrf_field() ?>
    <?php if ($edit): ?><input type="hidden" name="id" value="<?= e($edit['id']) ?>"><?php endif; ?>
    <div class="row row-3">
      <div>
        <label>Client</label>
        <select name="client_id" required>
          <?php foreach ($clients as $c): ?>
            <option value="<?= e($c['id']) ?>" <?= ($edit['client_id'] ?? '') === $c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div>
        <label>Status</label>
        <select name="status">
          <?php foreach (link_statuses() as $s): ?>
            <option value="<?= e($s) ?>" <?= ($edit['status'] ?? 'queued') === $s ? 'selected' : '' ?>><?= e(status_label($s)) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div><label>Work month</label><input type="month" name="work_month" value="<?= e($edit['work_month'] ?? $month) ?>" required></div>
      <div><label>Target URL</label><input name="target_url" value="<?= e($edit['target_url'] ?? '') ?>"></div>
      <div><label>Site domain</label><input name="site_domain" value="<?= e($edit['site_domain'] ?? '') ?>"></div>
      <div><label>Link type</label><input name="link_type" value="<?= e($edit['link_type'] ?? '') ?>"></div>
      <div><label>Live URL</label><input name="live_url" value="<?= e($edit['live_url'] ?? '') ?>"></div>
      <div><label>DR</label><input type="number" step="0.1" name="dr" value="<?= e((string) ($edit['dr'] ?? '')) ?>"></div>
      <div><label>Price</label><input type="number" step="0.01" name="price" value="<?= e((string) ($edit['price'] ?? '0')) ?>"></div>
      <div><label>Cost</label><input type="number" step="0.01" name="cost" value="<?= e((string) ($edit['cost'] ?? '0')) ?>"></div>
      <?php if (is_admin($user)): ?>
      <div>
        <label>Assignee</label>
        <select name="assignee_id">
          <option value="">—</option>
          <?php foreach ($users as $u): ?>
            <option value="<?= e($u['id']) ?>" <?= ($edit['assignee_id'] ?? '') === $u['id'] ? 'selected' : '' ?>><?= e($u['full_name']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <?php endif; ?>
      <div><label>Notes</label><input name="notes" value="<?= e($edit['notes'] ?? '') ?>"></div>
    </div>
    <div class="actions">
      <button class="cta" type="submit"><?= $edit ? 'Save task' : 'Create task' ?></button>
      <?php if ($edit): ?><a class="btn-outline" href="<?= e(url('/tasks?month=' . urlencode($month))) ?>">Cancel</a><?php endif; ?>
    </div>
  </form>
</div>

<div class="panel">
  <h2>Inventory</h2>
  <div class="scroll">
    <table>
      <thead><tr><th>Client</th><th>Site</th><th>Status</th><th>Assignee</th><th>Price</th><th>Cost</th><th></th></tr></thead>
      <tbody>
      <?php foreach ($tasks as $t): ?>
        <tr>
          <td><?= e($t['client_name'] ?? '') ?></td>
          <td><?= e($t['site_domain'] ?? '—') ?><div class="muted small"><?= e($t['live_url'] ?? '') ?></div></td>
          <td><span class="badge"><?= e(status_label($t['status'])) ?></span></td>
          <td><?= e($t['assignee_name'] ?? '—') ?></td>
          <td><?= e(money($t['price'])) ?></td>
          <td><?= e(money($t['cost'])) ?></td>
          <td>
            <a class="btn-outline" href="<?= e(url('/tasks?month=' . urlencode($month) . '&edit=' . urlencode($t['id']))) ?>">Edit</a>
            <?php if (is_admin($user)): ?>
              <form class="inline" method="post" action="<?= e(url('/tasks/delete')) ?>" onsubmit="return confirm('Delete task?')">
                <?= csrf_field() ?>
                <input type="hidden" name="id" value="<?= e($t['id']) ?>">
                <button class="btn-outline btn-danger" type="submit">Delete</button>
              </form>
            <?php endif; ?>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
