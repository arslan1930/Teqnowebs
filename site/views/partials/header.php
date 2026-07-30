<header class="site-header">
  <div class="inner">
    <a class="brand font-display" href="<?= e(url('/')) ?>">
      <img src="<?= e(url('/logo.svg')) ?>" alt="">
      Teqnowebs
    </a>
    <nav class="nav" aria-label="Primary">
      <a href="<?= e(url('/services')) ?>">Services</a>
      <a href="<?= e(url('/software')) ?>">Software</a>
      <a href="<?= e(url('/blog')) ?>">Blog</a>
      <a href="<?= e(url('/about')) ?>">About</a>
      <a href="<?= e(url('/contact')) ?>">Contact</a>
      <a class="cta" href="<?= e(url('/contact')) ?>">Get a quote</a>
    </nav>
    <details class="nav-mobile">
      <summary aria-label="Menu" style="width:2.5rem;height:2.5rem;display:grid;place-items:center;">
        <span style="display:flex;flex-direction:column;gap:4px;width:1.1rem;">
          <span style="height:2px;background:var(--ink);"></span>
          <span style="height:2px;background:var(--ink);"></span>
          <span style="height:2px;background:var(--ink);"></span>
        </span>
      </summary>
      <nav class="mobile-panel">
        <a href="<?= e(url('/services')) ?>">Services</a>
        <a href="<?= e(url('/software')) ?>">Software</a>
        <a href="<?= e(url('/blog')) ?>">Blog</a>
        <a href="<?= e(url('/about')) ?>">About</a>
        <a href="<?= e(url('/contact')) ?>">Contact</a>
      </nav>
    </details>
  </div>
</header>
