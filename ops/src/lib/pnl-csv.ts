import type { MonthPnL } from "./types";

/** Pure CSV helper — safe for browser demo mode (no SQLite). */
export function pnlToCsv(pnl: MonthPnL): string {
  const lines = [
    "section,name,revenue,cost,profit_or_count",
    `summary,${pnl.month},${pnl.revenue},${pnl.taskCosts + pnl.expenses},${pnl.profit}`,
    ...pnl.byClient.map(
      (c) => `client,"${c.clientName}",${c.revenue},${c.cost},${c.profit}`,
    ),
    ...pnl.byStaff.map(
      (s) => `staff,"${s.userName}",${s.revenue},${s.cost},${s.publishedCount}`,
    ),
  ];
  return lines.join("\n");
}
