<div style="padding-top:6rem;">
  <section class="atmosphere section" style="border:0;">
    <div class="wrap">
      <p class="eyebrow">Software</p>
      <h1 class="font-display" style="font-size:clamp(2rem,4vw,3rem);max-width:40rem;">Custom systems for sales, finance, and operations.</h1>
      <p class="muted" style="max-width:36rem;font-size:1.1rem;">Built around how your team actually works.</p>
    </div>
  </section>
  <?php
  $modules = [
    ['sales','01','Sales manager / CRM','Pipeline from lead to closed deal.',['Lead capture','Contacts','Quotes','Follow-ups','Team ownership','Forecasts','Activity history','Invoicing handoff'], false],
    ['finance','02','Finance management','Expenses, cashflow, trusted reports.',['Income/expense','Cashflow','Chart of accounts','Budgets','Vendors','Exports','Role access','Works with invoicing'], true],
    ['invoicing','03','Invoicing','Professional invoices and payment status.',['Invoice numbering','Payment status','Tax records','Partial payments','Billing history','PDF links'], false],
    ['warehouse','04','Warehouse & collection','Stock, locations, dispatch readiness.',['Stock levels','Receiving','Low-stock alerts','Floor dashboards','SKU basics','Fulfillment handoff'], true],
    ['tracking','05','Order tracking','Live path from order to delivery.',['Status timelines','Customer tracking links','Assignments','Exceptions','Cycle-time reports','Integrations'], false],
  ];
  foreach ($modules as $m): ?>
    <section id="<?= e($m[0]) ?>" class="section" style="<?= $m[5] ? 'background:rgba(226,232,240,.35);' : '' ?>">
      <div class="wrap">
        <p class="accent" style="font-size:.75rem;font-weight:600;margin:0;"><?= e($m[1]) ?></p>
        <h2 class="font-display" style="font-size:1.75rem;margin:.4rem 0;"><?= e($m[2]) ?></h2>
        <p class="muted"><?= e($m[3]) ?></p>
        <ul class="grid-2" style="list-style:none;padding:0;margin:1.5rem 0 0;">
          <?php foreach ($m[4] as $item): ?>
            <li class="card-soft" style="background:#fff;padding:.85rem 1rem;font-size:.875rem;"><?= e($item) ?></li>
          <?php endforeach; ?>
        </ul>
      </div>
    </section>
  <?php endforeach; ?>
  <section class="band-soft section">
    <div class="wrap" style="display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;align-items:center;">
      <div>
        <h2 class="font-display" style="margin:0;">Need a module tailored to your workflow?</h2>
        <p class="muted" style="margin:.4rem 0 0;">Tell us what your team runs today.</p>
      </div>
      <a class="cta" href="<?= e(url('/contact')) ?>">Request a quote</a>
    </div>
  </section>
</div>
