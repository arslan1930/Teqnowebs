import type { PunchStatus } from "./types";

export type EmployeeTheme = {
  bg: string;
  border: string;
  text: string;
  solid: string;
};

const THEMES: EmployeeTheme[] = [
  { bg: "#dbeafe", border: "#3b82f6", text: "#1e3a8a", solid: "#2563eb" },
  { bg: "#dcfce7", border: "#22c55e", text: "#14532d", solid: "#16a34a" },
  { bg: "#ffedd5", border: "#f97316", text: "#9a3412", solid: "#ea580c" },
  { bg: "#fce7f3", border: "#ec4899", text: "#9d174d", solid: "#db2777" },
  { bg: "#e0e7ff", border: "#6366f1", text: "#312e81", solid: "#4f46e5" },
  { bg: "#fef9c3", border: "#eab308", text: "#854d0e", solid: "#ca8a04" },
  { bg: "#ccfbf1", border: "#14b8a6", text: "#115e59", solid: "#0d9488" },
  { bg: "#ffe4e6", border: "#f43f5e", text: "#9f1239", solid: "#e11d48" },
  { bg: "#ede9fe", border: "#8b5cf6", text: "#5b21b6", solid: "#7c3aed" },
  { bg: "#e0f2fe", border: "#0ea5e9", text: "#075985", solid: "#0284c7" },
  { bg: "#f3e8ff", border: "#a855f7", text: "#6b21a8", solid: "#9333ea" },
  { bg: "#ecfccb", border: "#84cc16", text: "#3f6212", solid: "#65a30d" },
];

export function employeeTheme(userId: string): EmployeeTheme {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 33 + userId.charCodeAt(i)) >>> 0;
  return THEMES[h % THEMES.length];
}

export type StatusVisual = {
  label: string;
  tone: "ok" | "warn" | "bad" | "info" | "muted" | "accent";
  bg: string;
  border: string;
  text: string;
  dot: string;
};

export function statusVisual(
  status: PunchStatus,
  opts?: { onLeave?: boolean; isHoliday?: boolean; checkedIn?: boolean },
): StatusVisual {
  if (opts?.isHoliday) {
    return {
      label: "Holiday",
      tone: "info",
      bg: "#e0f2fe",
      border: "#7dd3fc",
      text: "#075985",
      dot: "#0ea5e9",
    };
  }
  if (opts?.onLeave || status === "on_leave") {
    return {
      label: "On leave",
      tone: "accent",
      bg: "#ede9fe",
      border: "#c4b5fd",
      text: "#5b21b6",
      dot: "#8b5cf6",
    };
  }
  switch (status) {
    case "on_time":
      return {
        label: "Present",
        tone: "ok",
        bg: "#dcfce7",
        border: "#86efac",
        text: "#14532d",
        dot: "#16a34a",
      };
    case "late":
      return {
        label: "Late",
        tone: "warn",
        bg: "#ffedd5",
        border: "#fdba74",
        text: "#9a3412",
        dot: "#ea580c",
      };
    case "half_leave":
      return {
        label: "Half leave",
        tone: "warn",
        bg: "#fef9c3",
        border: "#fde047",
        text: "#854d0e",
        dot: "#ca8a04",
      };
    case "absent":
      return {
        label: "Absent",
        tone: "bad",
        bg: "#ffe4e6",
        border: "#fda4af",
        text: "#9f1239",
        dot: "#e11d48",
      };
    case "missing_checkout":
      return {
        label: "Missing out",
        tone: "warn",
        bg: "#ffedd5",
        border: "#fdba74",
        text: "#9a3412",
        dot: "#f97316",
      };
    case "holiday":
      return {
        label: "Holiday",
        tone: "info",
        bg: "#e0f2fe",
        border: "#7dd3fc",
        text: "#075985",
        dot: "#0ea5e9",
      };
    default:
      return {
        label: opts?.checkedIn ? "In office" : "Not in",
        tone: "muted",
        bg: "#f1f5f9",
        border: "#cbd5e1",
        text: "#475569",
        dot: "#94a3b8",
      };
  }
}
