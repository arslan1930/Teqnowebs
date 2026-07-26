<div class="admin-nav">
  <div class="wrap" style="display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:center;justify-content:space-between;">
    <div>
      <a href="<?= e(url('/admin/posts')) ?>">Posts</a>
      <a href="<?= e(url('/admin/team')) ?>">Team</a>
      <a href="<?= e(url('/admin/inquiries')) ?>">Inquiries</a>
      <a href="<?= e(url('/staff')) ?>">Staff hub</a>
      <a href="<?= e(url('/')) ?>">View site</a>
    </div>
    <form method="post" action="<?= e(url('/logout')) ?>" style="margin:0;">
      <?= csrf_field() ?>
      <button class="btn-outline" type="submit" style="padding:.4rem .8rem;">Sign out</button>
    </form>
  </div>
</div>
