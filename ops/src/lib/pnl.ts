import { dbListExpenses, dbListTasks, dbListUsers } from "./db";
import type { MonthPnL } from "./types";

export function computeMonthPnL(month: string): MonthPnL {
  const tasks = dbListTasks({ month });
  const billable = tasks.filter((t) => t.status === "published" || t.status === "live");
  const revenue = billable.reduce((s, t) => s + t.price, 0);
  const taskCosts = billable.reduce((s, t) => s + t.cost, 0);
  const expenses = dbListExpenses(month).reduce((s, e) => s + e.amount, 0);

  const byClientMap = new Map<
    string,
    { clientId: string; clientName: string; revenue: number; cost: number }
  >();
  for (const t of billable) {
    const cur = byClientMap.get(t.clientId) || {
      clientId: t.clientId,
      clientName: t.clientName || t.clientId,
      revenue: 0,
      cost: 0,
    };
    cur.revenue += t.price;
    cur.cost += t.cost;
    byClientMap.set(t.clientId, cur);
  }

  const users = dbListUsers().filter((u) => u.role === "staff");
  const byStaff = users.map((u) => {
    const mine = billable.filter((t) => t.assigneeId === u.id);
    return {
      userId: u.id,
      userName: u.fullName,
      publishedCount: mine.length,
      revenue: mine.reduce((s, t) => s + t.price, 0),
      cost: mine.reduce((s, t) => s + t.cost, 0),
    };
  });

  return {
    month,
    revenue,
    taskCosts,
    expenses,
    profit: revenue - taskCosts - expenses,
    byClient: [...byClientMap.values()]
      .map((c) => ({ ...c, profit: c.revenue - c.cost }))
      .sort((a, b) => b.profit - a.profit),
    byStaff: byStaff.sort((a, b) => b.publishedCount - a.publishedCount),
  };
}

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
