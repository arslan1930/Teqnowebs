<?php $c = app_config()['contact']; ?>
<footer class="footer">
  <div class="wrap cols">
    <div>
      <p class="font-display" style="font-size:1.1rem;font-weight:600;margin:0;">Teqnowebs</p>
      <p class="muted" style="font-size:.875rem;margin-top:.75rem;max-width:16rem;line-height:1.5;">
        Websites, design, SEO, link building, and custom business software.
      </p>
    </div>
    <div>
      <p class="eyebrow" style="margin:0;">Explore</p>
      <ul style="list-style:none;padding:0;margin:.75rem 0 0;font-size:.875rem;line-height:2;">
        <li><a href="<?= e(url('/services')) ?>">Services</a></li>
        <li><a href="<?= e(url('/software')) ?>">Software</a></li>
        <li><a href="<?= e(url('/blog')) ?>">Blog</a></li>
        <li><a href="<?= e(url('/about')) ?>">About</a></li>
        <li><a href="<?= e(url('/contact')) ?>">Contact</a></li>
      </ul>
    </div>
    <div>
      <p class="eyebrow" style="margin:0;">Contact</p>
      <ul class="muted" style="list-style:none;padding:0;margin:.75rem 0 0;font-size:.875rem;line-height:1.8;">
        <li><a href="mailto:<?= e($c['email']) ?>"><?= e($c['email']) ?></a></li>
        <li><a href="<?= e($c['phone_href']) ?>"><?= e($c['phone']) ?></a></li>
        <li><?= e($c['address']) ?></li>
        <li><a href="<?= e($c['linkedin_href']) ?>" target="_blank" rel="noopener"><?= e($c['linkedin_label']) ?></a></li>
      </ul>
    </div>
  </div>
  <div style="border-top:1px solid var(--line);">
    <div class="wrap" style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding:1rem 1.25rem;font-size:.75rem;" class="muted">
      <span class="muted">&copy; <?= date('Y') ?> Teqnowebs. All rights reserved.</span>
      <?php if (current_user()): ?>
        <a class="muted" href="<?= e(url('/staff')) ?>">Staff tools</a>
      <?php else: ?>
        <a class="muted" href="<?= e(url('/login')) ?>">Staff login</a>
      <?php endif; ?>
    </div>
  </div>
</footer>
