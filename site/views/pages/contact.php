<div style="padding-top:6rem;">
  <section class="atmosphere section" style="border:0;">
    <div class="wrap">
      <p class="eyebrow">Contact</p>
      <h1 class="font-display" style="font-size:clamp(2rem,4vw,3rem);">Tell us what you want to build.</h1>
      <p class="muted">We reply <?= e($contact['reply_time']) ?>.</p>
    </div>
  </section>
  <section class="section">
    <div class="wrap grid-2">
      <div>
        <?php if ($msg = flash('success')): ?><div class="alert alert-ok"><?= e($msg) ?></div><?php endif; ?>
        <?php if ($msg = flash('error')): ?><div class="alert alert-err"><?= e($msg) ?></div><?php endif; ?>
        <form class="form" method="post" action="<?= e(url('/contact')) ?>">
          <?= csrf_field() ?>
          <label>Name<input name="name" required></label>
          <label>Email<input type="email" name="email" required></label>
          <label>Company<input name="company"></label>
          <label>Phone<input name="phone"></label>
          <label>Interest
            <select name="interest">
              <?php foreach (['Website','UI/UX','SEO / Link building','Graphic design','Custom software','Other'] as $opt): ?>
                <option><?= e($opt) ?></option>
              <?php endforeach; ?>
            </select>
          </label>
          <label>Message<textarea name="message" rows="5" required></textarea></label>
          <button class="cta" type="submit">Send message</button>
        </form>
      </div>
      <aside class="card-soft" style="height:fit-content;">
        <h2 class="font-display" style="margin-top:0;">Direct</h2>
        <ul class="muted" style="list-style:none;padding:0;font-size:.875rem;line-height:1.9;">
          <li><a href="mailto:<?= e($contact['email']) ?>"><?= e($contact['email']) ?></a></li>
          <li><a href="<?= e($contact['phone_href']) ?>"><?= e($contact['phone']) ?></a></li>
          <li><?= e($contact['address']) ?></li>
          <li><a href="<?= e($contact['linkedin_href']) ?>" target="_blank" rel="noopener"><?= e($contact['linkedin_label']) ?></a></li>
        </ul>
      </aside>
    </div>
  </section>
</div>
