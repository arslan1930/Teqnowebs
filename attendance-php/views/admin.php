<?php
/** @var string $tab */
$tabs = [
    'roster' => 'Today',
    'report' => 'Reports',
    'staff' => 'Staff',
    'leaves' => 'Leaves',
    'holidays' => 'Holidays',
    'timings' => 'Timings',
    'settings' => 'Settings',
];
?>
<div class="panel">
  <h1>Attendance admin</h1>
  <p class="muted"><?= e($today) ?> · <?= e($tz) ?> · Admins do not punch attendance.</p>
  <div class="tabs">
    <?php foreach ($tabs as $key => $label): ?>
      <a class="<?= $tab === $key ? 'active' : '' ?>" href="<?= e(url('/admin?tab=' . $key)) ?>"><?= e($label) ?></a>
    <?php endforeach; ?>
  </div>
</div>

<?php if ($tab === 'roster'): ?>
<div class="panel">
  <h2>Today’s roster</h2>
  <div class="scroll">
    <table>
      <thead><tr><th>Name</th><th>Group</th><th>Status</th><th>Check-in</th><th>Check-out</th></tr></thead>
      <tbody>
      <?php foreach ($roster as $row): ?>
        <?php $p = $row['profile']; $s = $row['status']; ?>
        <tr>
          <td><?= e($p['full_name']) ?></td>
          <td><?= e($p['staff_group']) ?></td>
          <td><span class="badge <?= e(badge_class($s['punch_status'])) ?>"><?= e(str_replace('_', ' ', $s['punch_status'])) ?></span></td>
          <td><?= e(!empty($s['check_in']) ? format_clock((string) $s['check_in']['created_at'], $tz) : '—') ?></td>
          <td><?= e(!empty($s['check_out']) ? format_clock((string) $s['check_out']['created_at'], $tz) : '—') ?></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<div class="panel">
  <h2>Manual day edit</h2>
  <form method="post" action="<?= e(url('/admin/manual-day')) ?>">
    <?= csrf_field() ?>
    <input type="hidden" name="tab" value="roster">
    <div class="row row-3">
      <div>
        <label>Staff</label>
        <select name="user_id" required>
          <?php foreach ($profiles as $p): if (($p['role'] ?? '') !== 'staff') continue; ?>
            <option value="<?= e($p['id']) ?>"><?= e($p['full_name']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div><label>Date</label><input type="date" name="date" value="<?= e($today) ?>" required></div>
      <div><label>Note</label><input type="text" name="note" value="Manual admin edit"></div>
      <div><label>Check-in (HH:MM)</label><input type="time" name="check_in"></div>
      <div><label>Check-out (HH:MM)</label><input type="time" name="check_out"></div>
    </div>
    <div class="actions"><button class="cta" type="submit">Save day</button></div>
  </form>
</div>
<?php endif; ?>

<?php if ($tab === 'report'): ?>
<div class="panel">
  <h2>Reports</h2>
  <form method="get" action="<?= e(url('/admin')) ?>" class="row row-3">
    <input type="hidden" name="tab" value="report">
    <div><label>From</label><input type="date" name="from" value="<?= e($from) ?>"></div>
    <div><label>To</label><input type="date" name="to" value="<?= e($to) ?>"></div>
    <div>
      <label>Staff</label>
      <select name="user_id">
        <option value="">All staff</option>
        <?php foreach ($profiles as $p): if (($p['role'] ?? '') !== 'staff') continue; ?>
          <option value="<?= e($p['id']) ?>" <?= $filter_user === $p['id'] ? 'selected' : '' ?>><?= e($p['full_name']) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="actions">
      <button class="btn-outline" type="submit">Filter</button>
      <a class="cta" href="<?= e(url('/admin/export?from=' . urlencode($from) . '&to=' . urlencode($to) . '&user_id=' . urlencode($filter_user))) ?>">Export CSV</a>
    </div>
  </form>
  <div class="scroll" style="margin-top:1rem;">
    <table>
      <thead><tr><th>Date</th><th>Name</th><th>Group</th><th>Status</th><th>In</th><th>Out</th><th>Note</th></tr></thead>
      <tbody>
      <?php foreach (array_slice($report, 0, 200) as $r): ?>
        <tr>
          <td><?= e($r['date']) ?></td>
          <td><?= e($r['user_name']) ?></td>
          <td><?= e($r['staff_group']) ?></td>
          <td><span class="badge <?= e(badge_class($r['status'])) ?>"><?= e(str_replace('_', ' ', $r['status'])) ?></span></td>
          <td><?= e($r['check_in_at'] ? format_clock((string) $r['check_in_at'], $tz) : '—') ?></td>
          <td><?= e($r['check_out_at'] ? format_clock((string) $r['check_out_at'], $tz) : '—') ?></td>
          <td><?= e($r['note'] ?? '') ?></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php endif; ?>

<?php if ($tab === 'staff'): ?>
<div class="panel">
  <h2>Add staff</h2>
  <form method="post" action="<?= e(url('/admin/staff')) ?>">
    <?= csrf_field() ?>
    <input type="hidden" name="tab" value="staff">
    <div class="row row-2">
      <div><label>Full name</label><input name="full_name" required></div>
      <div><label>Email</label><input type="email" name="email" required></div>
      <div><label>Password</label><input type="text" name="password" required minlength="6" value="attendance123"></div>
      <div>
        <label>Group</label>
        <select name="staff_group"><option value="female">Female</option><option value="male">Male</option></select>
      </div>
      <div>
        <label>Role</label>
        <select name="role"><option value="staff">Staff</option><option value="admin">Admin</option></select>
      </div>
    </div>
    <div class="actions"><button class="cta" type="submit">Add</button></div>
  </form>
</div>
<div class="panel">
  <h2>Team</h2>
  <div class="scroll">
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Role / group</th><th>Active</th><th>Password</th></tr></thead>
      <tbody>
      <?php foreach ($profiles as $p): ?>
        <tr>
          <td colspan="5" style="padding-top:1rem;">
            <form method="post" action="<?= e(url('/admin/staff-update')) ?>" class="row row-3">
              <?= csrf_field() ?>
              <input type="hidden" name="tab" value="staff">
              <input type="hidden" name="id" value="<?= e($p['id']) ?>">
              <div><label>Name</label><input name="full_name" value="<?= e($p['full_name']) ?>"></div>
              <div><label>Email</label><input value="<?= e($p['email']) ?>" disabled></div>
              <div>
                <label>Role</label>
                <select name="role">
                  <option value="staff" <?= $p['role'] === 'staff' ? 'selected' : '' ?>>Staff</option>
                  <option value="admin" <?= $p['role'] === 'admin' ? 'selected' : '' ?>>Admin</option>
                </select>
              </div>
              <div>
                <label>Group</label>
                <select name="staff_group">
                  <option value="female" <?= $p['staff_group'] === 'female' ? 'selected' : '' ?>>Female</option>
                  <option value="male" <?= $p['staff_group'] === 'male' ? 'selected' : '' ?>>Male</option>
                </select>
              </div>
              <div style="display:flex;align-items:end;gap:.5rem;">
                <label style="display:flex;align-items:center;gap:.35rem;margin:0;">
                  <input type="checkbox" name="active" <?= (int) $p['active'] ? 'checked' : '' ?> style="width:auto"> Active
                </label>
                <button class="btn-outline" type="submit">Save</button>
              </div>
            </form>
            <form method="post" action="<?= e(url('/admin/password')) ?>" class="row row-2" style="margin-top:.5rem;">
              <?= csrf_field() ?>
              <input type="hidden" name="tab" value="staff">
              <input type="hidden" name="id" value="<?= e($p['id']) ?>">
              <div><label>Reset password</label><input name="password" minlength="6" placeholder="new password"></div>
              <div style="display:flex;align-items:end;"><button class="btn-outline" type="submit">Reset</button></div>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php endif; ?>

<?php if ($tab === 'leaves'): ?>
<div class="panel">
  <h2>Leave requests</h2>
  <div class="scroll">
    <table>
      <thead><tr><th>Date</th><th>Staff</th><th>Status</th><th>Reason</th><th></th></tr></thead>
      <tbody>
      <?php foreach ($leaves as $l): ?>
        <tr>
          <td><?= e($l['leave_date']) ?></td>
          <td><?= e($l['full_name'] ?? $l['user_id']) ?></td>
          <td><span class="badge"><?= e($l['status']) ?></span></td>
          <td><?= e($l['reason'] ?? '') ?></td>
          <td>
            <?php if ($l['status'] === 'pending'): ?>
              <form class="inline" method="post" action="<?= e(url('/admin/leave-review')) ?>">
                <?= csrf_field() ?>
                <input type="hidden" name="tab" value="leaves">
                <input type="hidden" name="id" value="<?= e($l['id']) ?>">
                <input type="hidden" name="status" value="approved">
                <button class="btn-outline" type="submit">Approve</button>
              </form>
              <form class="inline" method="post" action="<?= e(url('/admin/leave-review')) ?>">
                <?= csrf_field() ?>
                <input type="hidden" name="tab" value="leaves">
                <input type="hidden" name="id" value="<?= e($l['id']) ?>">
                <input type="hidden" name="status" value="rejected">
                <button class="btn-outline btn-danger" type="submit">Reject</button>
              </form>
            <?php endif; ?>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php endif; ?>

<?php if ($tab === 'holidays'): ?>
<div class="panel">
  <h2>Add holiday</h2>
  <form method="post" action="<?= e(url('/admin/holiday')) ?>">
    <?= csrf_field() ?>
    <input type="hidden" name="tab" value="holidays">
    <div class="row row-3">
      <div><label>Date</label><input type="date" name="date" required></div>
      <div><label>Title</label><input name="title" required></div>
      <div><label>Note</label><input name="note"></div>
    </div>
    <div class="actions"><button class="cta" type="submit">Add</button></div>
  </form>
</div>
<div class="panel">
  <h2>Holidays</h2>
  <table>
    <thead><tr><th>Date</th><th>Title</th><th>Note</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($holidays as $h): ?>
      <tr>
        <td><?= e($h['holiday_date']) ?></td>
        <td><?= e($h['title']) ?></td>
        <td><?= e($h['note'] ?? '') ?></td>
        <td>
          <form method="post" action="<?= e(url('/admin/holiday-delete')) ?>">
            <?= csrf_field() ?>
            <input type="hidden" name="tab" value="holidays">
            <input type="hidden" name="id" value="<?= e($h['id']) ?>">
            <button class="btn-outline btn-danger" type="submit">Remove</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
<?php endif; ?>

<?php if ($tab === 'timings'): ?>
<div class="panel">
  <h2>Office timings</h2>
  <?php foreach ($timings as $t): ?>
    <form method="post" action="<?= e(url('/admin/timing')) ?>" style="margin-bottom:1rem;">
      <?= csrf_field() ?>
      <input type="hidden" name="tab" value="timings">
      <input type="hidden" name="staff_group" value="<?= e($t['staff_group']) ?>">
      <h3 class="font-display" style="font-size:1rem;"><?= e(ucfirst((string) $t['staff_group'])) ?></h3>
      <div class="row row-3">
        <div><label>Start</label><input type="time" name="start_time" value="<?= e(substr((string) $t['start_time'], 0, 5)) ?>"></div>
        <div><label>End</label><input type="time" name="end_time" value="<?= e(substr((string) $t['end_time'], 0, 5)) ?>"></div>
        <div><label>Late after (minutes)</label><input type="number" name="late_after_minutes" value="<?= (int) $t['late_after_minutes'] ?>"></div>
      </div>
      <div class="actions"><button class="btn-outline" type="submit">Save</button></div>
    </form>
  <?php endforeach; ?>
</div>
<?php endif; ?>

<?php if ($tab === 'settings'): ?>
<div class="panel">
  <h2>Settings</h2>
  <form method="post" action="<?= e(url('/admin/settings')) ?>">
    <?= csrf_field() ?>
    <input type="hidden" name="tab" value="settings">
    <label>Timezone</label>
    <input name="timezone" value="<?= e($settings['timezone']) ?>">
    <label>Allowed office IPs (one per line — reference for Hostinger IP allowlist)</label>
    <textarea name="allowed_ips" rows="5"><?= e(implode("\n", $settings['allowed_ips'] ?? [])) ?></textarea>
    <div class="actions"><button class="cta" type="submit">Save settings</button></div>
  </form>
</div>
<?php endif; ?>
