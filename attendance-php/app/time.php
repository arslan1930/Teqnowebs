<?php

declare(strict_types=1);

function app_timezone(): string
{
    return app_config()['timezone'] ?? 'Asia/Karachi';
}

/** @return array{dateStr:string,hour:int,minute:int,second:int} */
function parts_in_tz(?DateTimeInterface $date = null, ?string $timeZone = null): array
{
    $tz = new DateTimeZone($timeZone ?? app_timezone());
    $dt = $date instanceof DateTimeInterface
        ? DateTimeImmutable::createFromInterface($date)->setTimezone($tz)
        : new DateTimeImmutable('now', $tz);

    return [
        'dateStr' => $dt->format('Y-m-d'),
        'hour' => (int) $dt->format('G'),
        'minute' => (int) $dt->format('i'),
        'second' => (int) $dt->format('s'),
    ];
}

function today_date_str(?string $timeZone = null): string
{
    return parts_in_tz(null, $timeZone)['dateStr'];
}

function minutes_since_midnight(?DateTimeInterface $date = null, ?string $timeZone = null): int
{
    $p = parts_in_tz($date, $timeZone);
    return $p['hour'] * 60 + $p['minute'];
}

function hhmm_to_minutes(string $hhmm): int
{
    [$h, $m] = array_pad(explode(':', $hhmm), 2, 0);
    return ((int) $h) * 60 + ((int) $m);
}

function event_date_str(string $iso, ?string $timeZone = null): string
{
    return parts_in_tz(new DateTimeImmutable($iso), $timeZone)['dateStr'];
}

function format_clock(string $iso, ?string $timeZone = null): string
{
    $tz = new DateTimeZone($timeZone ?? app_timezone());
    $dt = (new DateTimeImmutable($iso))->setTimezone($tz);
    return strtolower(str_replace(' ', '', $dt->format('g:ia')));
}

function format_when(string $iso, ?string $timeZone = null): string
{
    $tz = new DateTimeZone($timeZone ?? app_timezone());
    $dt = (new DateTimeImmutable($iso))->setTimezone($tz);
    return $dt->format('D j M') . ' · ' . format_clock($iso, $timeZone);
}

function add_days(string $dateStr, int $delta): string
{
    $d = new DateTimeImmutable($dateStr . 'T12:00:00Z');
    return $d->modify(($delta >= 0 ? '+' : '') . $delta . ' days')->format('Y-m-d');
}

/** @return list<string> */
function each_date_inclusive(string $from, string $to): array
{
    $out = [];
    $cur = $from;
    while ($cur <= $to) {
        $out[] = $cur;
        $cur = add_days($cur, 1);
    }
    return $out;
}

function end_of_month(string $ym): string
{
    [$y, $m] = array_map('intval', explode('-', $ym));
    return (new DateTimeImmutable(sprintf('%04d-%02d-01', $y, $m)))
        ->modify('last day of this month')
        ->format('Y-m-d');
}
