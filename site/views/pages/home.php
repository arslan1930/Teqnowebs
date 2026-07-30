<section class="atmosphere hero">
  <div class="wrap hero-grid">
    <div>
      <p class="font-display" style="font-size:clamp(2.5rem,8vw,4.5rem);font-weight:600;margin:0;letter-spacing:-.02em;">Teqnowebs</p>
      <div style="margin-top:1.25rem;height:4px;width:6rem;background:var(--accent);"></div>
      <h1 class="font-display">Web, design, growth, and software that run your business.</h1>
      <p class="muted" style="max-width:28rem;font-size:1.05rem;line-height:1.6;">
        From websites, UI/UX, and SEO to sales, finance, and order tracking — Teqnowebs builds what customers see and what your team uses every day.
      </p>
      <div style="margin-top:1.75rem;display:flex;flex-wrap:wrap;gap:.75rem;">
        <a class="cta" href="<?= e(url('/contact')) ?>">Book a call</a>
        <a class="btn-outline" href="<?= e(url('/services')) ?>">Explore services</a>
      </div>
    </div>
    <div style="min-height:280px;border-radius:1rem;background:linear-gradient(150deg,#eef2f8,#f6f9fc 50%,#e9eef6);"></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <p class="eyebrow">What we build</p>
    <h2 class="font-display" style="font-size:1.85rem;margin:.5rem 0 1.5rem;">Five pillars. One partner.</h2>
    <div class="grid-3">
      <?php foreach ([
        ['01','Website development','Business sites, stores, and landing pages that load fast and convert.', '/services#web'],
        ['02','UI / UX design','Research, wireframes, and interfaces built for clarity and conversion.', '/services#uiux'],
        ['03','SEO & link building','Technical SEO, content, and authority so the right people find you.', '/services#seo'],
        ['04','Graphic design','Brand identity and creatives that look intentional — not templated.', '/services#design'],
        ['05','Custom software','Sales manager, finance, invoicing, warehouse, and order tracking.', '/software'],
      ] as $p): ?>
        <a class="card-soft" href="<?= e(url($p[3])) ?>">
          <span class="accent" style="font-size:.75rem;font-weight:600;"><?= e($p[0]) ?></span>
          <h3 class="font-display" style="margin:.4rem 0;"><?= e($p[1]) ?></h3>
          <p class="muted" style="font-size:.875rem;margin:0;line-height:1.5;"><?= e($p[2]) ?></p>
        </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="band-soft section">
  <div class="wrap">
    <p class="eyebrow">Software</p>
    <h2 class="font-display" style="font-size:1.85rem;margin:.5rem 0 1.25rem;">Systems your team uses every day</h2>
    <div class="grid-3">
      <?php foreach ([
        ['Sales manager','CRM pipeline, leads, follow-ups, and team targets.'],
        ['Finance','Expenses, cashflow, and reports finance can trust.'],
        ['Invoicing','Clean invoices, payments, and records.'],
        ['Warehouse','Stock, collection, and inventory clarity.'],
        ['Order tracking','Status from order to delivery — visible.'],
      ] as $s): ?>
        <div class="card-soft" style="background:#fff;">
          <h3 class="font-display" style="margin:0;"><?= e($s[0]) ?></h3>
          <p class="muted" style="font-size:.875rem;margin:.4rem 0 0;"><?= e($s[1]) ?></p>
        </div>
      <?php endforeach; ?>
    </div>
    <p style="margin-top:1.5rem;"><a class="accent" style="font-weight:600;font-size:.875rem;" href="<?= e(url('/software')) ?>">See software modules →</a></p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <h2 class="font-display" style="font-size:1.85rem;">How we work</h2>
    <div class="grid-4" style="margin-top:1.5rem;">
      <?php foreach ([
        ['01','Discover','Goals, audience, and the systems you already run.'],
        ['02','Design','Brand, UX, and architecture before a line of waste.'],
        ['03','Build','Ship the site, creatives, or software your team needs.'],
        ['04','Grow','SEO, links, and iteration so results compound.'],
      ] as $step): ?>
        <div>
          <p class="accent" style="font-size:.75rem;font-weight:600;margin:0;"><?= e($step[0]) ?></p>
          <h3 class="font-display" style="margin:.4rem 0;"><?= e($step[1]) ?></h3>
          <p class="muted" style="font-size:.875rem;margin:0;"><?= e($step[2]) ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
