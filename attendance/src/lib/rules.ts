/** Business rules for Teqnowebs attendance (Asia/Karachi wall clock). */

/** Earliest allowed checkout: 3:00pm */
export const CHECKOUT_EARLIEST_MINUTES = 15 * 60;

/** Checkout before 4:00pm (and at/after 3:00pm) counts as half leave */
export const HALF_LEAVE_UNTIL_MINUTES = 16 * 60;

export function checkoutBlockedReason(minutesSinceMidnight: number): string | null {
  if (minutesSinceMidnight < CHECKOUT_EARLIEST_MINUTES) {
    return "Check-out opens at 3:00pm. Leaving earlier is not allowed in the system.";
  }
  return null;
}

export function isHalfLeaveCheckout(minutesSinceMidnight: number): boolean {
  return (
    minutesSinceMidnight >= CHECKOUT_EARLIEST_MINUTES &&
    minutesSinceMidnight < HALF_LEAVE_UNTIL_MINUTES
  );
}
