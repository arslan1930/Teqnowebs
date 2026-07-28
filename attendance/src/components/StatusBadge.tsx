import { statusVisual } from "@/lib/employee-ui";
import type { PunchStatus } from "@/lib/types";

export function StatusBadge({
  status,
  onLeave,
  isHoliday,
  checkedIn,
  large,
}: {
  status: PunchStatus;
  onLeave?: boolean;
  isHoliday?: boolean;
  checkedIn?: boolean;
  large?: boolean;
}) {
  const v = statusVisual(status, { onLeave, isHoliday, checkedIn });
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${
        large ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
      }`}
      style={{ background: v.bg, borderColor: v.border, color: v.text }}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: v.dot }}
        aria-hidden
      />
      {v.label}
    </span>
  );
}
