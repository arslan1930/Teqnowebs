<?php
/** @var array $user */
/** @var list<string> $old_sites */
/** @var string $new_raw */
/** @var list<string> $results */
/** @var array|null $filter_meta */
$isAdmin = ($user['role'] ?? '') === 'admin';
?>
<div class="panel">
  <h1>Site inventory filter</h1>
  <p class="muted">
    Box 1 shows the old inventory from the admin database (site names only, no https).
    Paste new sites in Box 2, filter out duplicates, then add the remaining sites back into inventory.
  </p>
</div>

<div class="inventory-grid">
  <div class="panel inventory-box">
    <h2>1. Old inventory</h2>
    <p class="muted small">From admin database · <?= count($old_sites) ?> site(s) · hostnames only</p>
    <textarea class="inventory-list" readonly rows="16" aria-label="Old inventory sites"><?= e(implode("\n", $old_sites)) ?></textarea>
    <?php if ($isAdmin): ?>
      <form method="post" action="<?= e(url('/inventory/admin-add')) ?>" style="margin-top:1rem;">
        <?= csrf_field() ?>
        <label>Admin: add sites directly to old inventory</label>
        <textarea name="admin_sites" rows="4" placeholder="one site per line&#10;example.com&#10;https://another-site.com/page"></textarea>
        <div class="actions">
          <button class="btn-outline" type="submit">Save to old inventory</button>
        </div>
      </form>
    <?php endif; ?>
  </div>

  <div class="panel inventory-box">
    <h2>2. New sites</h2>
    <p class="muted small">Paste sites for filtration (URLs or hostnames — https:// is stripped)</p>
    <form method="post" action="<?= e(url('/inventory/filter')) ?>">
      <?= csrf_field() ?>
      <textarea name="new_sites" rows="16" placeholder="https://new-site.com&#10;another-new.org&#10;www.brand-new.net/post"><?= e($new_raw) ?></textarea>
      <div class="actions">
        <button class="cta" type="submit">Filter sites</button>
      </div>
    </form>
  </div>
</div>

<div class="panel inventory-box">
  <h2>3. Filter results</h2>
  <?php if ($filter_meta): ?>
    <p class="muted small">
      Input: <?= (int) $filter_meta['input_count'] ?> ·
      Excluded (already in old inventory): <?= (int) $filter_meta['excluded'] ?> ·
      New: <?= (int) $filter_meta['result_count'] ?>
    </p>
  <?php else: ?>
    <p class="muted small">Run <strong>Filter sites</strong> to compare Box 2 against Box 1.</p>
  <?php endif; ?>

  <textarea class="inventory-list" readonly rows="10" aria-label="Filtered results"><?= e(implode("\n", $results)) ?></textarea>

  <form method="post" action="<?= e(url('/inventory/add')) ?>" style="margin-top:1rem;">
    <?= csrf_field() ?>
    <input type="hidden" name="results" value="<?= e(implode("\n", $results)) ?>">
    <div class="actions">
      <button class="cta" type="submit" <?= $results ? '' : 'disabled' ?>>Add sites to old inventory</button>
      <?php if ($results): ?>
        <span class="muted small"><?= count($results) ?> site(s) will be added to Box 1</span>
      <?php endif; ?>
    </div>
  </form>
</div>
