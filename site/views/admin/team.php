<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;">
  <h1 class="font-display" style="margin:0;">Team</h1>
  <a class="cta" href="<?= e(url('/admin/team/create')) ?>">Add member</a>
</div>
<table class="table" style="margin-top:1.25rem;">
  <thead><tr><th>Name</th><th>Group</th><th></th></tr></thead>
  <tbody>
  <?php foreach ($members as $member): ?>
    <tr>
      <td><strong><?= e($member['name']) ?></strong><br><span class="muted"><?= e($member['role']) ?></span></td>
      <td><?= e($member['group_label']) ?></td>
      <td style="white-space:nowrap;">
        <a href="<?= e(url('/admin/team/' . $member['id'] . '/edit')) ?>">Edit</a>
        <form method="post" action="<?= e(url('/admin/team/' . $member['id'] . '/delete')) ?>" style="display:inline;" onsubmit="return confirm('Remove?')">
          <?= csrf_field() ?>
          <button type="submit" style="border:0;background:none;color:#b91c1c;cursor:pointer;">Delete</button>
        </form>
      </td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
