<h1 class="font-display"><?= $member ? 'Edit member' : 'Add member' ?></h1>
<form class="form" method="post" action="<?= e($member ? url('/admin/team/' . $member['id'] . '/update') : url('/admin/team')) ?>" style="max-width:32rem;margin-top:1rem;">
  <?= csrf_field() ?>
  <label>Name<input name="name" required value="<?= e($member['name'] ?? '') ?>"></label>
  <label>Role<input name="role" required value="<?= e($member['role'] ?? '') ?>"></label>
  <label>Group key<input name="group_key" required value="<?= e($member['group_key'] ?? 'leadership-tech') ?>"></label>
  <label>Group label<input name="group_label" required value="<?= e($member['group_label'] ?? 'Leadership & Tech') ?>"></label>
  <label>Photo path<input name="photo" value="<?= e($member['photo'] ?? '') ?>" placeholder="team/name.jpg"></label>
  <label>Sort order<input type="number" name="sort_order" value="<?= e((string) ($member['sort_order'] ?? '0')) ?>"></label>
  <button class="cta" type="submit">Save</button>
</form>
