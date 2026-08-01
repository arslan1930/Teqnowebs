<?php

declare(strict_types=1);

/**
 * Normalize a site URL/domain to hostname only (no https://, path, or trailing slash).
 */
function normalize_site_name(string $raw): string
{
    $s = trim($raw);
    if ($s === '') {
        return '';
    }
    // Drop query/hash
    $s = preg_split('/[?#]/', $s, 2)[0] ?? $s;
    $s = preg_replace('#^https?://#i', '', $s) ?? $s;
    $s = preg_replace('#^//#', '', $s) ?? $s;
    // Take host only (before first /)
    $s = explode('/', $s, 2)[0];
    $s = rtrim($s, ". \t");
    $s = strtolower($s);
    // Drop trailing port for display consistency
    $s = preg_replace('/:\d+$/', '', $s) ?? $s;
    return $s;
}

/** @return list<string> */
function parse_site_list(string $text): array
{
    $parts = preg_split('/[\r\n,;\t]+/', $text) ?: [];
    $out = [];
    $seen = [];
    foreach ($parts as $part) {
        $site = normalize_site_name($part);
        if ($site === '' || isset($seen[$site])) {
            continue;
        }
        // Basic host sanity
        if (!preg_match('/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/i', $site)) {
            continue;
        }
        $seen[$site] = true;
        $out[] = $site;
    }
    return $out;
}

/** @return list<array{id:string,site_name:string,created_at:string,created_by:?string}> */
function list_site_inventory(): array
{
    return db()->query(
        'SELECT id, site_name, created_at, created_by FROM site_inventory ORDER BY site_name ASC'
    )->fetchAll();
}

/** @return list<string> */
function list_inventory_site_names(): array
{
    $rows = db()->query('SELECT site_name FROM site_inventory ORDER BY site_name ASC')->fetchAll();
    return array_map(fn ($r) => (string) $r['site_name'], $rows);
}

/** @return array{added:int,skipped:int,sites:list<string>} */
function add_sites_to_inventory(array $sites, ?string $createdBy = null): array
{
    $added = 0;
    $skipped = 0;
    $inserted = [];
    $ins = db()->prepare(
        'INSERT INTO site_inventory (id, site_name, created_at, created_by) VALUES (?, ?, ?, ?)'
    );
    foreach ($sites as $site) {
        $site = normalize_site_name((string) $site);
        if ($site === '') {
            continue;
        }
        try {
            $ins->execute([new_id('site'), $site, date('c'), $createdBy]);
            $added++;
            $inserted[] = $site;
        } catch (Throwable) {
            $skipped++;
        }
    }
    return ['added' => $added, 'skipped' => $skipped, 'sites' => $inserted];
}

/**
 * Return sites from $newSites that are NOT already in inventory.
 *
 * @param list<string> $newSites
 * @return array{results:list<string>,excluded:int,input_count:int}
 */
function filter_new_sites_against_inventory(array $newSites): array
{
    $old = array_fill_keys(list_inventory_site_names(), true);
    $results = [];
    $excluded = 0;
    foreach ($newSites as $site) {
        $site = normalize_site_name((string) $site);
        if ($site === '') {
            continue;
        }
        if (isset($old[$site])) {
            $excluded++;
            continue;
        }
        $results[] = $site;
    }
    // unique preserve order
    $results = array_values(array_unique($results));
    return [
        'results' => $results,
        'excluded' => $excluded,
        'input_count' => count($newSites),
    ];
}

function ensure_inventory_seeded(PDO $pdo): void
{
    $count = (int) $pdo->query('SELECT COUNT(*) FROM site_inventory')->fetchColumn();
    if ($count > 0) {
        return;
    }
    // Backfill unique domains from link tasks + a few demos
    $domains = $pdo->query(
        "SELECT DISTINCT site_domain FROM link_tasks WHERE site_domain IS NOT NULL AND site_domain != ''"
    )->fetchAll(PDO::FETCH_COLUMN);
    $seed = array_merge(
        is_array($domains) ? $domains : [],
        ['example-blog.com', 'guestpost-network.com', 'outreach-sites.example']
    );
    $ins = $pdo->prepare(
        'INSERT INTO site_inventory (id, site_name, created_at, created_by) VALUES (?, ?, ?, ?)'
    );
    $now = date('c');
    $seen = [];
    foreach ($seed as $raw) {
        $site = normalize_site_name((string) $raw);
        if ($site === '' || isset($seen[$site])) {
            continue;
        }
        $seen[$site] = true;
        try {
            $ins->execute([new_id('site'), $site, $now, 'system']);
        } catch (Throwable) {
            // ignore dupes
        }
    }
}
