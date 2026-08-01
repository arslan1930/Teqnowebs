<p><a href="<?= e(url('/admin/inquiries')) ?>">← Back</a></p>
<article class="card-soft" style="margin-top:1rem;">
  <h1 class="font-display" style="margin-top:0;"><?= e($inquiry['name']) ?></h1>
  <p class="muted" style="font-size:.875rem;"><?= e($inquiry['email']) ?> · <?= e($inquiry['phone'] ?? '') ?> · <?= e($inquiry['company'] ?? '') ?></p>
  <p>Interest: <?= e($inquiry['interest'] ?? '') ?></p>
  <p style="white-space:pre-wrap;line-height:1.6;"><?= e($inquiry['message']) ?></p>
  <form method="post" action="<?= e(url('/admin/inquiries/' . $inquiry['id'] . '/delete')) ?>" onsubmit="return confirm('Delete?')">
    <?= csrf_field() ?>
    <button type="submit" style="color:#b91c1c;background:none;border:1px solid #fecaca;border-radius:.5rem;padding:.5rem .85rem;cursor:pointer;">Delete</button>
  </form>
</article>
