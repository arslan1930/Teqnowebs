<?php

declare(strict_types=1);

/** @return list<list<string>> */
function parse_csv(string $text): array
{
    $rows = [];
    $row = [];
    $cell = '';
    $inQuotes = false;
    $len = strlen($text);
    for ($i = 0; $i < $len; $i++) {
        $ch = $text[$i];
        if ($inQuotes) {
            if ($ch === '"' && ($i + 1) < $len && $text[$i + 1] === '"') {
                $cell .= '"';
                $i++;
            } elseif ($ch === '"') {
                $inQuotes = false;
            } else {
                $cell .= $ch;
            }
        } elseif ($ch === '"') {
            $inQuotes = true;
        } elseif ($ch === ',') {
            $row[] = $cell;
            $cell = '';
        } elseif ($ch === "\n" || $ch === "\r") {
            if ($ch === "\r" && ($i + 1) < $len && $text[$i + 1] === "\n") {
                $i++;
            }
            $row[] = $cell;
            if (array_filter($row, fn ($c) => trim($c) !== '')) {
                $rows[] = $row;
            }
            $row = [];
            $cell = '';
        } else {
            $cell .= $ch;
        }
    }
    if ($cell !== '' || $row) {
        $row[] = $cell;
        if (array_filter($row, fn ($c) => trim($c) !== '')) {
            $rows[] = $row;
        }
    }
    return $rows;
}

function normalize_header(string $h): string
{
    return strtolower(trim(str_replace('_', ' ', $h)));
}

function map_link_status(string $raw): string
{
    $s = strtolower(trim(preg_replace('/\s+/', '_', $raw) ?? $raw));
    if ($s === 'in-progress' || $s === 'progress') {
        return 'in_progress';
    }
    if (in_array($s, link_statuses(), true)) {
        return $s;
    }
    if (str_contains($s, 'live')) {
        return 'live';
    }
    if (str_contains($s, 'publish')) {
        return 'published';
    }
    if (str_contains($s, 'lost') || str_contains($s, 'drop')) {
        return 'lost';
    }
    return 'queued';
}

/** @return array{imported:int,errors:list<string>} */
function import_link_csv(string $text): array
{
    $headerMap = [
        'client' => 'client',
        'client name' => 'client',
        'target url' => 'targetUrl',
        'target' => 'targetUrl',
        'target page' => 'targetUrl',
        'site' => 'siteDomain',
        'site domain' => 'siteDomain',
        'site placed on' => 'siteDomain',
        'domain' => 'siteDomain',
        'type' => 'linkType',
        'link type' => 'linkType',
        'status' => 'status',
        'live url' => 'liveUrl',
        'live' => 'liveUrl',
        'dr' => 'dr',
        'price' => 'price',
        'price charged' => 'price',
        'cost' => 'cost',
        'cost to you' => 'cost',
        'assignee' => 'assigneeEmail',
        'assignee email' => 'assigneeEmail',
        'assigned to' => 'assigneeEmail',
        'month' => 'workMonth',
        'work month' => 'workMonth',
        'notes' => 'notes',
        'note' => 'notes',
    ];

    $text = preg_replace('/^\xEF\xBB\xBF/', '', $text) ?? $text;
    $rows = parse_csv($text);
    if (count($rows) < 2) {
        throw new RuntimeException('CSV needs a header row and at least one data row');
    }

    $headers = array_map('normalize_header', $rows[0]);
    $keys = array_map(fn ($h) => $headerMap[$h] ?? '', $headers);
    if (!in_array('client', $keys, true)) {
        throw new RuntimeException('CSV must include a "Client" column');
    }

    $imported = 0;
    $errors = [];
    for ($i = 1; $i < count($rows); $i++) {
        $row = $rows[$i];
        $data = [];
        foreach ($keys as $idx => $key) {
            if ($key === '') {
                continue;
            }
            $data[$key] = trim((string) ($row[$idx] ?? ''));
        }
        $clientName = $data['client'] ?? '';
        if ($clientName === '') {
            $errors[] = 'Row ' . ($i + 1) . ': missing client';
            continue;
        }

        try {
            $stmt = db()->prepare('SELECT * FROM clients WHERE lower(name) = lower(?)');
            $stmt->execute([$clientName]);
            $client = $stmt->fetch();
            if (!$client) {
                $id = new_id('client');
                db()->prepare(
                    'INSERT INTO clients (id, name, website, package_name, monthly_fee, start_date, active, notes, created_at)
                     VALUES (?, ?, NULL, NULL, 0, NULL, 1, NULL, ?)'
                )->execute([$id, $clientName, date('c')]);
                $clientId = $id;
            } else {
                $clientId = $client['id'];
            }

            $assigneeId = null;
            if (!empty($data['assigneeEmail'])) {
                $u = db()->prepare('SELECT id FROM users WHERE lower(email) = lower(?)');
                $u->execute([$data['assigneeEmail']]);
                $assigneeId = $u->fetchColumn() ?: null;
            }

            $status = map_link_status($data['status'] ?? 'queued');
            $now = date('c');
            $published = in_array($status, ['published', 'live'], true) ? $now : null;
            db()->prepare(
                'INSERT INTO link_tasks
                 (id, client_id, target_url, site_domain, link_type, status, live_url, dr, price, cost, assignee_id, work_month, notes, published_at, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            )->execute([
                new_id('task'),
                $clientId,
                $data['targetUrl'] ?: null,
                $data['siteDomain'] ?: null,
                $data['linkType'] ?: null,
                $status,
                $data['liveUrl'] ?: null,
                isset($data['dr']) && $data['dr'] !== '' ? (float) $data['dr'] : null,
                (float) ($data['price'] ?? 0),
                (float) ($data['cost'] ?? 0),
                $assigneeId,
                $data['workMonth'] ?: current_month(),
                $data['notes'] ?: null,
                $published,
                $now,
                $now,
            ]);
            $imported++;
        } catch (Throwable $e) {
            $errors[] = 'Row ' . ($i + 1) . ': ' . $e->getMessage();
        }
    }

    return ['imported' => $imported, 'errors' => $errors];
}
