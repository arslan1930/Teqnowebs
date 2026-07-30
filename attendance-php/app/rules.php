<?php

declare(strict_types=1);

/** Earliest allowed checkout: 3:00pm */
const CHECKOUT_EARLIEST_MINUTES = 15 * 60;

/** Checkout before 4:00pm (and at/after 3:00pm) counts as half leave */
const HALF_LEAVE_UNTIL_MINUTES = 16 * 60;

function checkout_blocked_reason(int $minutesSinceMidnight): ?string
{
    if ($minutesSinceMidnight < CHECKOUT_EARLIEST_MINUTES) {
        return 'Check-out opens at 3:00pm. Leaving earlier is not allowed in the system.';
    }
    return null;
}

function is_half_leave_checkout(int $minutesSinceMidnight): bool
{
    return $minutesSinceMidnight >= CHECKOUT_EARLIEST_MINUTES
        && $minutesSinceMidnight < HALF_LEAVE_UNTIL_MINUTES;
}
