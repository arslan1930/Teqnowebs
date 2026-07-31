<?php
/** @var array $user */
/** @var array $status */
/** @var array|null $timing */
/** @var array|null $holiday */
/** @var array|null $leave */
/** @var array $leaves */
/** @var array $recent */
?>
<div class="panel">
  <h1>Hello, <?= e($user['full_name']) ?></h1>
  <p class="muted"><?= e($today) ?> · <?= e($tz) ?> · <?= e(ucfirst((string) $user['staff_group'])) ?> shift
    <?php if ($timing): ?>
      (<?= e(substr((string) $timing['start_time'], 0, 5)) ?>–<?= e(substr((string) $timing['end_time'], 0, 5)) ?>)
    <?php endif; ?>
  </p>
  <p style="margin:.75rem 0 0;">
    <span class="badge <?= e(badge_class($status['punch_status'])) ?>"><?= e(str_replace('_', ' ', $status['punch_status'])) ?></span>
  </p>
  <p><?= e($status['message']) ?></p>
  <div class="actions">
    <?php if (!$holiday && !$leave && !$status['checked_in']): ?>
      <form method="post" action="<?= e(url('/punch')) ?>">
        <?= csrf_field() ?>
        <input type="hidden" name="type" value="check_in">
        <button class="cta" type="submit">Check in</button>
      </form>
    <?php elseif (!$holiday && !$leave && $status['checked_in'] && !$status['checked_out']): ?>
      <form method="post" action="<?= e(url('/punch')) ?>">
        <?= csrf_field() ?>
        <input type="hidden" name="type" value="check_out">
        <button class="cta" type="submit">Check out</button>
      </form>
      <span class="muted small">Checkout opens at 3:00pm. 3:00–3:59pm = half leave.</span>
    <?php endif; ?>
  </div>
</div>

<div class="row row-2">
  <div class="panel">
    <h2>Request leave</h2>
    <p class="muted small">1 personal leave per month (pending or approved counts). Used this month: <?= (int) $used_leave ?>/1</p>
    <form method="post" action="<?= e(url('/leave')) ?>">
      <?= csrf_field() ?>
      <label>Date</label>
      <input type="date" name="date" required>
      <label>Reason (optional)</label>
      <input type="text" name="reason" maxlength="200">
      <div class="actions">
        <button class="btn-outline" type="submit" <?= $used_leave >= 1 ? 'disabled' : '' ?>>Submit request</button>
      </div>
    </form>
  </div>
  <div class="panel">
    <h2>Your leave requests</h2>
    <?php if (!$leaves): ?>
      <p class="muted">None yet.</p>
    <?php else: ?>
      <div class="scroll">
        <table>
          <thead><tr><th>Date</th><th>Status</th><th>Reason</th></tr></thead>
          <tbody>
          <?php foreach ($leaves as $l): ?>
            <tr>
              <td><?= e($l['leave_date']) ?></td>
              <td><span class="badge"><?= e($l['status']) ?></span></td>
              <td><?= e($l['reason'] ?? '') ?></td>
            </tr>
          <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>
  </div>
</div>

<div class="panel">
  <h2>Recent punches</h2>
  <?php if (!$recent): ?>
    <p class="muted">No events yet.</p>
  <?php else: ?>
    <div class="scroll">
      <table>
        <thead><tr><th>When</th><th>Type</th><th>Note</th></tr></thead>
        <tbody>
        <?php foreach ($recent as $ev): ?>
          <tr>
            <td><?= e(format_when((string) $ev['created_at'], $tz)) ?></td>
            <td><?= e(str_replace('_', ' ', (string) $ev['type'])) ?></td>
            <td><?= e($ev['note'] ?? '') ?></td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</div>
