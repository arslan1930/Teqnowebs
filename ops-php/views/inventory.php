<?php
/** @var array $user */
/** @var list<string> $old_sites */
/** @var string $new_raw */
/** @var list<string> $results */
/** @var array|null $filter_meta */
$isAdmin = ($user['role'] ?? '') === 'admin';
?>
<div class="panel inventory-hero">
  <h1>Site inventory filter</h1>
  <p class="muted" style="margin:0;max-width:42rem;">
    Compare new outreach sites against the admin inventory. Filter removes duplicates, then add only fresh hostnames back into the old list.
  </p>
</div>

<div class="inventory-grid">
  <div class="panel inventory-box inventory-box-old">
    <div class="inventory-head">
      <h2>Old inventory</h2>
      <span class="step-pill">Box 1 · Admin DB</span>
    </div>
    <p class="muted small" style="margin:.25rem 0 .75rem;">
      Hostnames only (no https) ·
      <span class="count-chip" style="color:var(--old);"><?= count($old_sites) ?> sites</span>
    </p>
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

  <div class="panel inventory-box inventory-box-new">
    <div class="inventory-head">
      <h2>New sites</h2>
      <span class="step-pill">Box 2 · Paste list</span>
    </div>
    <p class="muted small" style="margin:.25rem 0 .75rem;">
      Paste URLs or hostnames — <code>https://</code> is stripped on filter
    </p>
    <form method="post" action="<?= e(url('/inventory/filter')) ?>">
      <?= csrf_field() ?>
      <textarea name="new_sites" rows="16" placeholder="https://new-site.com&#10;another-new.org&#10;www.brand-new.net/post"><?= e($new_raw) ?></textarea>
      <div class="actions">
        <button class="cta" type="submit">Filter sites</button>
      </div>
    </form>
  </div>
</div>

<div class="panel inventory-box inventory-box-result">
  <div class="inventory-head">
    <h2>Filter results</h2>
    <span class="step-pill">Box 3 · New only</span>
  </div>

  <?php if ($filter_meta): ?>
    <div class="meta-row">
      <span class="meta-chip">Input <strong><?= (int) $filter_meta['input_count'] ?></strong></span>
      <span class="meta-chip">Excluded <strong><?= (int) $filter_meta['excluded'] ?></strong></span>
      <span class="meta-chip">New to add <strong><?= (int) $filter_meta['result_count'] ?></strong></span>
    </div>
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
        <span class="count-chip" style="color:var(--result);"><?= count($results) ?> will go to Box 1</span>
      <?php endif; ?>
    </div>
  </form>
</div>
