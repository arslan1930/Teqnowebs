<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;">
  <h1 class="font-display" style="margin:0;">Blog posts</h1>
  <a class="cta" href="<?= e(url('/admin/posts/create')) ?>">New post</a>
</div>
<table class="table" style="margin-top:1.25rem;">
  <thead><tr><th>Title</th><th>Status</th><th></th></tr></thead>
  <tbody>
  <?php foreach ($posts as $post): ?>
    <tr>
      <td>
        <strong><?= e($post['title']) ?></strong><br>
        <span class="muted"><?= e($post['slug']) ?></span>
      </td>
      <td><?= $post['published_at'] ? e(date('Y-m-d', strtotime($post['published_at']))) : 'draft' ?></td>
      <td style="white-space:nowrap;">
        <a href="<?= e(url('/admin/posts/' . $post['id'] . '/edit')) ?>">Edit</a>
        <form method="post" action="<?= e(url('/admin/posts/' . $post['id'] . '/delete')) ?>" style="display:inline;" onsubmit="return confirm('Delete?')">
          <?= csrf_field() ?>
          <button type="submit" style="border:0;background:none;color:#b91c1c;cursor:pointer;">Delete</button>
        </form>
      </td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
