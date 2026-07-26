<div style="padding-top:6rem;">
  <section class="atmosphere section" style="border:0;">
    <div class="wrap">
      <p class="eyebrow">Teqnowebs Blog</p>
      <h1 class="font-display" style="font-size:clamp(2rem,4vw,3rem);">Notes on web, design, SEO, and software.</h1>
      <p class="muted">Edit in the admin panel — plain PHP, no rebuild step.</p>
    </div>
  </section>
  <section class="section">
    <div class="wrap grid-2">
      <?php if (!$posts): ?>
        <p class="muted">No posts published yet.</p>
      <?php endif; ?>
      <?php foreach ($posts as $post): ?>
        <a class="card-soft" href="<?= e(url('/blog/' . $post['slug'])) ?>">
          <p class="muted" style="font-size:.75rem;margin:0;"><?= e(date('M j, Y', strtotime((string) $post['published_at']))) ?></p>
          <h2 class="font-display" style="font-size:1.25rem;margin:.5rem 0;"><?= e($post['title']) ?></h2>
          <p class="muted" style="font-size:.875rem;margin:0;"><?= e($post['excerpt'] ?? '') ?></p>
        </a>
      <?php endforeach; ?>
    </div>
  </section>
</div>
