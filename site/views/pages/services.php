<div style="padding-top:6rem;">
  <section class="atmosphere section" style="border:0;">
    <div class="wrap">
      <p class="eyebrow">Services</p>
      <h1 class="font-display" style="font-size:clamp(2rem,4vw,3rem);max-width:40rem;">Websites, UI/UX, design, and SEO — built to grow together.</h1>
      <p class="muted" style="max-width:36rem;font-size:1.1rem;">Full website delivery, interface design, brand creatives, and search growth under one roof.</p>
    </div>
  </section>
  <?php
  $services = [
    ['web','01','Website development','Sites that represent your brand, load fast, and turn visitors into customers.',['Business websites and company sites','Marketing and conversion landing pages','E-commerce stores and product catalogs','CMS setup and content workflows','Responsive builds','Performance and security basics','Hosting handoff','CRM and analytics integrations'], false],
    ['uiux','02','UI / UX design','Interfaces people understand quickly.',['User research','Information architecture','Wireframes','Prototypes','UI kits','Usability reviews','Conversion UX','Product UX for software'], true],
    ['design','03','Graphic design','Visual systems that feel owned.',['Logo and brand identity','Brand guidelines','Social creatives','Pitch decks','Print collateral','Ad creatives'], false],
    ['seo','04','SEO & link building','Technical foundations, content, and authority.',['Technical SEO audits','On-page SEO','Keyword research','Local SEO','Ethical link building','Competitor analysis','Migrations','Reporting dashboards'], true],
  ];
  foreach ($services as $s): ?>
    <section id="<?= e($s[0]) ?>" class="section" style="<?= $s[5] ? 'background:rgba(226,232,240,.35);' : '' ?>">
      <div class="wrap">
        <p class="accent" style="font-size:.75rem;font-weight:600;margin:0;"><?= e($s[1]) ?></p>
        <h2 class="font-display" style="font-size:1.75rem;margin:.4rem 0;"><?= e($s[2]) ?></h2>
        <p class="muted"><?= e($s[3]) ?></p>
        <ul class="grid-2" style="list-style:none;padding:0;margin:1.5rem 0 0;">
          <?php foreach ($s[4] as $item): ?>
            <li class="card-soft" style="background:#fff;padding:.85rem 1rem;font-size:.875rem;"><?= e($item) ?></li>
          <?php endforeach; ?>
        </ul>
      </div>
    </section>
  <?php endforeach; ?>
</div>
