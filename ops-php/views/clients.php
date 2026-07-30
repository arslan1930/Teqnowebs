<div class="panel">
  <h1>Clients</h1>
  <p class="muted">Packages, fees, and notes for the link desk.</p>
</div>

<div class="row row-2">
  <div class="panel">
    <h2><?= $edit ? 'Edit client' : 'Add client' ?></h2>
    <form method="post" action="<?= e(url('/clients/save')) ?>">
      <?= csrf_field() ?>
      <?php if ($edit): ?><input type="hidden" name="id" value="<?= e($edit['id']) ?>"><?php endif; ?>
      <label>Name</label>
      <input name="name" required value="<?= e($edit['name'] ?? '') ?>">
      <label>Website</label>
      <input name="website" value="<?= e($edit['website'] ?? '') ?>">
      <label>Package</label>
      <input name="package_name" value="<?= e($edit['package_name'] ?? '') ?>">
      <div class="row row-2">
        <div>
          <label>Monthly fee</label>
          <input type="number" step="0.01" name="monthly_fee" value="<?= e((string) ($edit['monthly_fee'] ?? '0')) ?>">
        </div>
        <div>
          <label>Start date</label>
          <input type="date" name="start_date" value="<?= e($edit['start_date'] ?? '') ?>">
        </div>
      </div>
      <label>Notes</label>
      <textarea name="notes" rows="3"><?= e($edit['notes'] ?? '') ?></textarea>
      <label style="display:flex;align-items:center;gap:.4rem;margin-top:.75rem;">
        <input type="checkbox" name="active" style="width:auto" <?= !$edit || (int) $edit['active'] ? 'checked' : '' ?>> Active
      </label>
      <div class="actions">
        <button class="cta" type="submit"><?= $edit ? 'Save' : 'Create' ?></button>
        <?php if ($edit): ?><a class="btn-outline" href="<?= e(url('/clients')) ?>">New</a><?php endif; ?>
      </div>
    </form>
  </div>
  <div class="panel">
    <h2>All clients</h2>
    <div class="scroll">
      <table>
        <thead><tr><th>Name</th><th>Fee</th><th>Active</th></tr></thead>
        <tbody>
        <?php foreach ($clients as $c): ?>
          <tr>
            <td><a class="accent" href="<?= e(url('/clients?id=' . urlencode($c['id']))) ?>"><?= e($c['name']) ?></a></td>
            <td><?= e(money($c['monthly_fee'])) ?></td>
            <td><?= (int) $c['active'] ? 'Yes' : 'No' ?></td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<?php if ($edit && $tasks): ?>
<div class="panel">
  <h2>Tasks for <?= e($edit['name']) ?></h2>
  <table>
    <thead><tr><th>Month</th><th>Site</th><th>Status</th><th>Price</th><th>Cost</th></tr></thead>
    <tbody>
    <?php foreach ($tasks as $t): ?>
      <tr>
        <td><?= e($t['work_month']) ?></td>
        <td><?= e($t['site_domain'] ?? '—') ?></td>
        <td><?= e(status_label($t['status'])) ?></td>
        <td><?= e(money($t['price'])) ?></td>
        <td><?= e(money($t['cost'])) ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php endif; ?>
