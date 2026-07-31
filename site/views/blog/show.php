<article style="padding-top:6rem;">
  <header class="atmosphere section" style="border:0;">
    <div class="wrap" style="max-width:48rem;">
      <p class="muted" style="font-size:.75rem;"><?= e(date('F j, Y', strtotime((string) $post['published_at']))) ?></p>
      <h1 class="font-display" style="font-size:clamp(2rem,4vw,2.75rem);"><?= e($post['title']) ?></h1>
      <?php if (!empty($post['excerpt'])): ?>
        <p class="muted" style="font-size:1.1rem;"><?= e($post['excerpt']) ?></p>
      <?php endif; ?>
    </div>
  </header>
  <div class="wrap" style="max-width:48rem;padding:2.5rem 1.25rem;line-height:1.7;font-size:1rem;">
    <?= nl2br(e($post['body'])) ?>
  </div>
  <div class="wrap" style="max-width:48rem;border-top:1px solid var(--line);padding:2rem 1.25rem;">
    <p class="muted">Talk to Teqnowebs about web, SEO, or software.</p>
    <a class="cta" href="<?= e(url('/contact')) ?>">Contact Teqnowebs</a>
  </div>
</article>
