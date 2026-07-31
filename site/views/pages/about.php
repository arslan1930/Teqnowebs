<div style="padding-top:6rem;">
  <section class="atmosphere section" style="border:0;">
    <div class="wrap">
      <p class="eyebrow">About Teqnowebs</p>
      <h1 class="font-display" style="font-size:clamp(2rem,4vw,3rem);max-width:42rem;">We build the face of your business — and the systems behind it.</h1>
      <p class="muted" style="max-width:40rem;font-size:1.1rem;line-height:1.6;">
        Teqnowebs is a digital agency for teams that need more than a pretty homepage. We design and develop websites, craft brand visuals, grow organic reach with SEO and link building, and ship custom software for sales, invoicing, warehouse, and order tracking.
      </p>
    </div>
  </section>
  <section class="section">
    <div class="wrap grid-3">
      <?php foreach ([
        ['Brand-first delivery','Your name and story lead every project.'],
        ['Practical tech','Maintainable sites, clear software, measurable SEO.'],
        ['One partner','Web, design, growth, and ops software under one plan.'],
      ] as $p): ?>
        <div>
          <h2 class="font-display" style="font-size:1.2rem;"><?= e($p[0]) ?></h2>
          <p class="muted" style="font-size:.875rem;"><?= e($p[1]) ?></p>
        </div>
      <?php endforeach; ?>
    </div>
  </section>
  <section class="section">
    <div class="wrap">
      <p class="eyebrow">Our team</p>
      <h2 class="font-display" style="font-size:1.85rem;">People behind the work</h2>
      <?php foreach ($groups as $key => $group): ?>
        <div style="margin-top:2rem;">
          <h3 class="font-display" style="font-size:1.1rem;color:var(--ink-soft);"><?= e($group['label']) ?></h3>
          <ul class="grid-4" style="list-style:none;padding:0;margin:1rem 0 0;">
            <?php foreach ($group['members'] as $member): ?>
              <li class="card-soft">
                <div style="width:3.5rem;height:3.5rem;border-radius:999px;background:#f1f5f9;display:grid;place-items:center;font-weight:600;color:var(--accent-deep);overflow:hidden;">
                  <?php
                    $initials = '';
                    foreach (preg_split('/\s+/', trim($member['name'])) as $part) {
                        $initials .= mb_substr($part, 0, 1);
                    }
                    $initials = mb_strtoupper(mb_substr($initials, 0, 2));
                  ?>
                  <?php if (!empty($member['photo']) && is_file(dirname(__DIR__, 2) . '/' . ltrim($member['photo'], '/'))): ?>
                    <img src="<?= e(url('/' . ltrim($member['photo'], '/'))) ?>" alt="<?= e($member['name']) ?>" style="width:100%;height:100%;object-fit:cover;">
                  <?php else: ?>
                    <?= e($initials) ?>
                  <?php endif; ?>
                </div>
                <p style="font-weight:600;margin:1rem 0 0;"><?= e($member['name']) ?></p>
                <p class="muted" style="font-size:.875rem;margin:.25rem 0 0;"><?= e($member['role']) ?></p>
              </li>
            <?php endforeach; ?>
          </ul>
        </div>
      <?php endforeach; ?>
    </div>
  </section>
  <section class="band-soft section">
    <div class="wrap" style="display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;align-items:center;">
      <div>
        <h2 class="font-display" style="margin:0;">Let's talk about your next build.</h2>
        <p class="muted" style="margin:.4rem 0 0;">No long decks — just a clear next step.</p>
      </div>
      <a class="cta" href="<?= e(url('/contact')) ?>">Contact Teqnowebs</a>
    </div>
  </section>
</div>
