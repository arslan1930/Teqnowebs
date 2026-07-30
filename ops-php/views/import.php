<div class="panel">
  <h1>CSV import</h1>
  <p class="muted">Paste or upload a CSV with a <strong>Client</strong> column. Optional: Target URL, Site domain, Link type, Status, Live URL, DR, Price, Cost, Assignee email, Work month, Notes.</p>
  <form method="post" action="<?= e(url('/import')) ?>" enctype="multipart/form-data">
    <?= csrf_field() ?>
    <label>Upload CSV</label>
    <input type="file" name="csv" accept=".csv,text/csv">
    <label>Or paste CSV</label>
    <textarea name="csv_text" rows="12" placeholder="Client,Site domain,Status,Price,Cost,Work month&#10;Demo Client Co,example.com,published,8000,3000,<?= e(date('Y-m')) ?>"></textarea>
    <div class="actions"><button class="cta" type="submit">Import</button></div>
  </form>
</div>
