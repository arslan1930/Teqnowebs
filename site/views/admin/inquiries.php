<h1 class="font-display">Contact inquiries</h1>
<table class="table" style="margin-top:1.25rem;">
  <thead><tr><th>From</th><th>When</th><th></th></tr></thead>
  <tbody>
  <?php if (!$inquiries): ?>
    <tr><td colspan="3" class="muted">No inquiries yet.</td></tr>
  <?php endif; ?>
  <?php foreach ($inquiries as $inquiry): ?>
    <tr>
      <td><strong><?= e($inquiry['name']) ?></strong><br><span class="muted"><?= e($inquiry['email']) ?> · <?= e($inquiry['interest'] ?? '') ?></span></td>
      <td><?= e(date('Y-m-d H:i', strtotime((string) $inquiry['created_at']))) ?></td>
      <td><a href="<?= e(url('/admin/inquiries/' . $inquiry['id'])) ?>">View</a></td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
