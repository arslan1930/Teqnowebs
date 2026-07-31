import { STATUS_LABELS, type LinkStatus } from "@/lib/types";

const COLORS: Record<LinkStatus, { bg: string; border: string; text: string }> = {
  queued: { bg: "#f1f5f9", border: "#cbd5e1", text: "#475569" },
  in_progress: { bg: "#dbeafe", border: "#93c5fd", text: "#1e40af" },
  published: { bg: "#dcfce7", border: "#86efac", text: "#14532d" },
  live: { bg: "#ccfbf1", border: "#5eead4", text: "#115e59" },
  lost: { bg: "#ffe4e6", border: "#fda4af", text: "#9f1239" },
};

export function StatusPill({ status }: { status: LinkStatus }) {
  const c = COLORS[status];
  return (
    <span
      className="inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold"
      style={{ background: c.bg, borderColor: c.border, color: c.text }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
