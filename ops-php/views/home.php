<div class="panel">
  <h1>Link desk</h1>
  <p class="muted">Month <?= e($month) ?> — clients, inventory, and P&L in one place.</p>
  <div class="stat-grid" style="margin-top:1rem;">
    <div class="stat"><span class="muted small">Revenue</span><strong><?= e(money($pnl['revenue'])) ?></strong></div>
    <div class="stat"><span class="muted small">Profit</span><strong><?= e(money($pnl['profit'])) ?></strong></div>
    <div class="stat"><span class="muted small">Queued</span><strong><?= (int) $queued ?></strong></div>
    <div class="stat"><span class="muted small">Published/Live</span><strong><?= (int) $live ?></strong></div>
  </div>
  <div class="actions">
    <a class="cta" href="<?= e(url('/tasks')) ?>">Open tasks</a>
    <a class="btn-outline" href="<?= e(url('/clients')) ?>">Clients</a>
    <a class="btn-outline" href="<?= e(url('/import')) ?>">Import CSV</a>
  </div>
</div>

<div class="row row-2">
  <div class="panel">
    <h2>Active clients</h2>
    <?php if (!$clients): ?>
      <p class="muted">No clients yet.</p>
    <?php else: ?>
      <table>
        <thead><tr><th>Name</th><th>Package</th><th>Fee</th></tr></thead>
        <tbody>
        <?php foreach (array_slice($clients, 0, 8) as $c): ?>
          <tr>
            <td><a class="accent" href="<?= e(url('/clients?id=' . urlencode($c['id']))) ?>"><?= e($c['name']) ?></a></td>
            <td><?= e($c['package_name'] ?? '—') ?></td>
            <td><?= e(money($c['monthly_fee'])) ?></td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    <?php endif; ?>
  </div>
  <div class="panel">
    <h2>Recent tasks</h2>
    <?php if (!$recent): ?>
      <p class="muted">No tasks this month.</p>
    <?php else: ?>
      <table>
        <thead><tr><th>Client</th><th>Site</th><th>Status</th></tr></thead>
        <tbody>
        <?php foreach ($recent as $t): ?>
          <tr>
            <td><?= e($t['client_name'] ?? '') ?></td>
            <td><?= e($t['site_domain'] ?? '—') ?></td>
            <td><span class="badge"><?= e(status_label($t['status'])) ?></span></td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    <?php endif; ?>
  </div>
</div>
