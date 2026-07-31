<?php

declare(strict_types=1);

require_once __DIR__ . '/rules.php';
require_once __DIR__ . '/time.php';

/** @param list<array<string,mixed>> $events */
function events_on_date(array $events, string $dateStr, string $timeZone): array
{
    return array_values(array_filter(
        $events,
        fn ($e) => event_date_str((string) $e['created_at'], $timeZone) === $dateStr
    ));
}

function is_late_checkin(string $checkInIso, array $timing, string $timeZone): bool
{
    $checkMins = minutes_since_midnight(new DateTimeImmutable($checkInIso), $timeZone);
    $limit = hhmm_to_minutes((string) $timing['start_time']) + (int) $timing['late_after_minutes'];
    return $checkMins > $limit;
}

/**
 * @param list<array<string,mixed>> $events
 * @return array{checked_in:bool,checked_out:bool,punch_status:string,message:string,check_in:?array,check_out:?array}
 */
function get_day_status(array $events, array $opts = []): array
{
    $timeZone = $opts['timezone'] ?? app_timezone();
    $dateStr = $opts['date_str'] ?? today_date_str($timeZone);
    $todays = events_on_date($events, $dateStr, $timeZone);
    usort($todays, fn ($a, $b) => strcmp((string) $a['created_at'], (string) $b['created_at']));

    $checkIn = null;
    $checkOut = null;
    foreach ($todays as $e) {
        if ($e['type'] === 'check_in' && !$checkIn) {
            $checkIn = $e;
        }
        if ($e['type'] === 'check_out' && !$checkOut) {
            $checkOut = $e;
        }
    }

    $checkedIn = (bool) $checkIn;
    $checkedOut = (bool) $checkOut;
    $isToday = $dateStr === today_date_str($timeZone);
    $timing = $opts['timing'] ?? null;
    $holiday = $opts['holiday'] ?? null;
    $leave = $opts['leave'] ?? null;

    $punchStatus = 'none';
    $message = 'Ready to check in.';

    if ($holiday) {
        $punchStatus = 'holiday';
        $message = 'Company holiday — attendance not required.';
    } elseif ($leave && ($leave['status'] ?? '') === 'approved') {
        $punchStatus = 'on_leave';
        $message = 'Approved leave today — attendance not required.';
    } elseif (!$checkedIn) {
        $punchStatus = $isToday ? 'none' : 'absent';
        $message = $isToday ? 'You have not checked in yet today.' : 'Absent — no check-in recorded.';
    } elseif ($checkedIn && !$checkedOut) {
        $late = $checkIn && $timing ? is_late_checkin((string) $checkIn['created_at'], $timing, $timeZone) : false;
        $punchStatus = $late ? 'late' : 'on_time';
        if ($isToday) {
            $message = $late
                ? 'Checked in late. Check-out opens at 3:00pm (3:00–3:59pm = half leave).'
                : 'Checked in. Check-out opens at 3:00pm (3:00–3:59pm = half leave).';
        } else {
            $punchStatus = 'missing_checkout';
            $message = 'Missing checkout — checked in but never checked out.';
        }
    } else {
        $late = $checkIn && $timing ? is_late_checkin((string) $checkIn['created_at'], $timing, $timeZone) : false;
        $outMins = $checkOut
            ? minutes_since_midnight(new DateTimeImmutable((string) $checkOut['created_at']), $timeZone)
            : 0;
        if (is_half_leave_checkout($outMins)) {
            $punchStatus = 'half_leave';
            $message = $late
                ? 'Half leave (checked out 3:00–3:59pm) · also late check-in.'
                : 'Half leave — checked out between 3:00pm and 4:00pm.';
        } else {
            $punchStatus = $late ? 'late' : 'on_time';
            $message = $punchStatus === 'late'
                ? 'Day complete (late check-in).'
                : 'Day complete — checked in and out after 4:00pm.';
        }
    }

    return [
        'checked_in' => $checkedIn,
        'checked_out' => $checkedOut,
        'punch_status' => $punchStatus,
        'message' => $message,
        'check_in' => $checkIn,
        'check_out' => $checkOut,
    ];
}

function badge_class(string $status): string
{
    return match ($status) {
        'on_time' => 'badge-ok',
        'late', 'half_leave', 'missing_checkout' => 'badge-warn',
        'absent' => 'badge-bad',
        'holiday', 'on_leave' => 'badge-info',
        default => '',
    };
}
