<div class="panel">
  <h1>Monthly P&L</h1>
  <form method="get" action="<?= e(url('/pnl')) ?>" class="actions">
    <input type="month" name="month" value="<?= e($month) ?>">
    <button class="btn-outline" type="submit">View</button>
  </form>
  <div class="stat-grid" style="margin-top:1rem;">
    <div class="stat"><span class="muted small">Revenue</span><strong><?= e(money($pnl['revenue'])) ?></strong></div>
    <div class="stat"><span class="muted small">Task costs</span><strong><?= e(money($pnl['task_costs'])) ?></strong></div>
    <div class="stat"><span class="muted small">Expenses</span><strong><?= e(money($pnl['expenses'])) ?></strong></div>
    <div class="stat"><span class="muted small">Profit</span><strong><?= e(money($pnl['profit'])) ?></strong></div>
  </div>
</div>

<div class="row row-2">
  <div class="panel">
    <h2>By client</h2>
    <table>
      <thead><tr><th>Client</th><th>Revenue</th><th>Cost</th><th>Profit</th></tr></thead>
      <tbody>
      <?php foreach ($pnl['by_client'] as $c): ?>
        <tr>
          <td><?= e($c['client_name']) ?></td>
          <td><?= e(money($c['revenue'])) ?></td>
          <td><?= e(money($c['cost'])) ?></td>
          <td><?= e(money($c['profit'])) ?></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <div class="panel">
    <h2>By staff</h2>
    <table>
      <thead><tr><th>Staff</th><th>Published</th><th>Revenue</th><th>Cost</th></tr></thead>
      <tbody>
      <?php foreach ($pnl['by_staff'] as $s): ?>
        <tr>
          <td><?= e($s['user_name']) ?></td>
          <td><?= (int) $s['published_count'] ?></td>
          <td><?= e(money($s['revenue'])) ?></td>
          <td><?= e(money($s['cost'])) ?></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>

<?php if (is_admin()): ?>
<div class="panel">
  <h2>Expenses</h2>
  <form method="post" action="<?= e(url('/expenses/save')) ?>" class="row row-3">
    <?= csrf_field() ?>
    <input type="hidden" name="month" value="<?= e($month) ?>">
    <div><label>Label</label><input name="label" required></div>
    <div><label>Amount</label><input type="number" step="0.01" name="amount" required></div>
    <div style="display:flex;align-items:end;"><button class="cta" type="submit">Add expense</button></div>
  </form>
  <table style="margin-top:1rem;">
    <thead><tr><th>Label</th><th>Amount</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($expenses as $e): ?>
      <tr>
        <td><?= e($e['label']) ?></td>
        <td><?= e(money($e['amount'])) ?></td>
        <td>
          <form method="post" action="<?= e(url('/expenses/delete')) ?>">
            <?= csrf_field() ?>
            <input type="hidden" name="month" value="<?= e($month) ?>">
            <input type="hidden" name="id" value="<?= e($e['id']) ?>">
            <button class="btn-outline btn-danger" type="submit">Remove</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php endif; ?>
