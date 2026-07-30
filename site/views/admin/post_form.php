<h1 class="font-display"><?= $post ? 'Edit post' : 'New post' ?></h1>
<form class="form" method="post" action="<?= e($post ? url('/admin/posts/' . $post['id'] . '/update') : url('/admin/posts')) ?>" style="max-width:40rem;margin-top:1rem;">
  <?= csrf_field() ?>
  <label>Title<input name="title" required value="<?= e($post['title'] ?? '') ?>"></label>
  <label>Slug<input name="slug" value="<?= e($post['slug'] ?? '') ?>" placeholder="auto from title"></label>
  <label>Excerpt<textarea name="excerpt" rows="2"><?= e($post['excerpt'] ?? '') ?></textarea></label>
  <label>Body<textarea name="body" rows="12" required><?= e($post['body'] ?? '') ?></textarea></label>
  <label>Published at<input type="datetime-local" name="published_at" value="<?= !empty($post['published_at']) ? e(date('Y-m-d\TH:i', strtotime($post['published_at']))) : '' ?>"></label>
  <button class="cta" type="submit">Save</button>
</form>
