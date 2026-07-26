import {
  demoAddExpense,
  demoAddUser,
  demoComputePnL,
  demoDeleteExpense,
  demoImportCsv,
  demoListClients,
  demoListExpenses,
  demoListTasks,
  demoListUsers,
  demoLogin,
  demoLogout,
  demoMe,
  demoUpdateUser,
  demoUpsertClient,
  demoUpsertTask,
  isDemoMode,
} from "./demo-store";
import { currentMonth } from "./format";
import { pnlToCsv } from "./pnl-csv";
import type { LinkStatus, LinkTask, User, UserRole } from "./types";

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

function requireDemoUser(): User {
  const user = demoMe();
  if (!user) throw new Error("Unauthorized");
  return user;
}

function requireDemoAdmin(): User {
  const user = requireDemoUser();
  if (user.role !== "admin") throw new Error("Admin only");
  return user;
}

function pathOnly(path: string) {
  return path.split("?")[0];
}

function queryOf(path: string) {
  const q = path.includes("?") ? path.slice(path.indexOf("?") + 1) : "";
  return new URLSearchParams(q);
}

function downloadCsv(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function demoGet<T>(path: string): Promise<T> {
  const base = pathOnly(path);
  const q = queryOf(path);

  if (base === "/api/auth/me") {
    return { user: demoMe() } as T;
  }

  if (base === "/api/home") {
    const user = requireDemoUser();
    const month = currentMonth();
    const mine =
      user.role === "staff"
        ? demoListTasks({ assigneeId: user.id })
        : demoListTasks();
    const inProgress = mine.filter((t) => t.status === "in_progress" || t.status === "queued");
    const recentPublished = mine
      .filter((t) => t.status === "published" || t.status === "live")
      .slice(0, 8);
    return {
      inProgressCount: inProgress.length,
      recentPublished,
      month,
      pnl: user.role === "admin" ? demoComputePnL(month) : null,
    } as T;
  }

  if (base === "/api/clients") {
    requireDemoUser();
    return { clients: demoListClients() } as T;
  }

  if (base.startsWith("/api/clients/")) {
    requireDemoUser();
    const id = base.slice("/api/clients/".length);
    const client = demoListClients().find((c) => c.id === id);
    if (!client) throw new Error("Not found");
    return { client, tasks: demoListTasks({ clientId: id }) } as T;
  }

  if (base === "/api/tasks") {
    const user = requireDemoUser();
    const filters = {
      clientId: q.get("clientId") || undefined,
      status: q.get("status") || undefined,
      month: q.get("month") || undefined,
      assigneeId:
        user.role === "staff" ? user.id : q.get("assigneeId") || undefined,
      publishedThisMonth: q.get("publishedThisMonth") === "1",
    };
    return { tasks: demoListTasks(filters) } as T;
  }

  if (base === "/api/pnl") {
    requireDemoAdmin();
    const month = q.get("month") || currentMonth();
    const pnl = demoComputePnL(month);
    if (q.get("format") === "csv") {
      downloadCsv(`pnl-${month}.csv`, pnlToCsv(pnl));
      return { ok: true } as T;
    }
    return { pnl } as T;
  }

  if (base === "/api/expenses") {
    requireDemoAdmin();
    return { expenses: demoListExpenses(q.get("month") || undefined) } as T;
  }

  if (base === "/api/users") {
    requireDemoAdmin();
    return { users: demoListUsers() } as T;
  }

  throw new Error(`Unknown demo GET ${path}`);
}

async function demoSend<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  const base = pathOnly(path);
  const data = (body || {}) as Record<string, unknown>;

  if (base === "/api/auth/login" && method === "POST") {
    const user = demoLogin(String(data.email || ""), String(data.password || ""));
    return { user } as T;
  }

  if (base === "/api/auth/logout" && method === "POST") {
    demoLogout();
    return { ok: true } as T;
  }

  if (base === "/api/clients" && method === "POST") {
    requireDemoAdmin();
    return {
      client: demoUpsertClient({
        name: String(data.name || ""),
        website: (data.website as string) || null,
        packageName: (data.packageName as string) || null,
        monthlyFee: Number(data.monthlyFee) || 0,
        startDate: (data.startDate as string) || null,
        active: data.active !== false,
        notes: (data.notes as string) || null,
      }),
    } as T;
  }

  if (base.startsWith("/api/clients/") && method === "PATCH") {
    requireDemoAdmin();
    const id = base.slice("/api/clients/".length);
    return {
      client: demoUpsertClient({
        id,
        name: String(data.name || demoListClients().find((c) => c.id === id)?.name || ""),
        ...data,
      }),
    } as T;
  }

  if (base === "/api/tasks" && method === "POST") {
    const user = requireDemoUser();
    if (!data.clientId || !data.workMonth || !data.status) {
      throw new Error("clientId, workMonth, status required");
    }
    const assigneeId = user.role === "staff" ? user.id : (data.assigneeId as string) || null;
    return {
      task: demoUpsertTask({
        clientId: String(data.clientId),
        targetUrl: (data.targetUrl as string) || null,
        siteDomain: (data.siteDomain as string) || null,
        linkType: (data.linkType as string) || null,
        status: data.status as LinkStatus,
        liveUrl: (data.liveUrl as string) || null,
        dr: data.dr == null ? null : Number(data.dr),
        price: Number(data.price) || 0,
        cost: Number(data.cost) || 0,
        assigneeId,
        workMonth: String(data.workMonth),
        notes: (data.notes as string) || null,
      }),
    } as T;
  }

  if (base.startsWith("/api/tasks/") && method === "PATCH") {
    const user = requireDemoUser();
    const id = base.slice("/api/tasks/".length);
    const existing = demoListTasks().find((t) => t.id === id);
    if (!existing) throw new Error("Not found");
    if (user.role === "staff" && existing.assigneeId && existing.assigneeId !== user.id) {
      throw new Error("Forbidden");
    }
    const patch = { ...data } as Partial<LinkTask>;
    if (user.role === "staff") delete patch.assigneeId;
    return {
      task: demoUpsertTask({
        id,
        clientId: patch.clientId || existing.clientId,
        targetUrl: patch.targetUrl ?? existing.targetUrl,
        siteDomain: patch.siteDomain ?? existing.siteDomain,
        linkType: patch.linkType ?? existing.linkType,
        status: (patch.status || existing.status) as LinkStatus,
        liveUrl: patch.liveUrl ?? existing.liveUrl,
        dr: patch.dr ?? existing.dr,
        price: patch.price ?? existing.price,
        cost: patch.cost ?? existing.cost,
        assigneeId:
          user.role === "staff" ? user.id : (patch.assigneeId ?? existing.assigneeId),
        workMonth: patch.workMonth || existing.workMonth,
        notes: patch.notes ?? existing.notes,
      }),
    } as T;
  }

  if (base === "/api/expenses" && method === "POST") {
    const admin = requireDemoAdmin();
    if (data.action === "delete" && data.id) {
      demoDeleteExpense(String(data.id));
      return { ok: true } as T;
    }
    if (!data.month || data.amount == null || !data.label) {
      throw new Error("month, amount, label required");
    }
    return {
      expense: demoAddExpense({
        month: String(data.month),
        amount: Number(data.amount),
        label: String(data.label),
        createdBy: admin.id,
      }),
    } as T;
  }

  if (base === "/api/users" && method === "POST") {
    requireDemoAdmin();
    if (data.action === "update" && data.id) {
      return {
        user: demoUpdateUser(String(data.id), {
          fullName: data.fullName as string | undefined,
          role: data.role as UserRole | undefined,
          active: data.active as boolean | undefined,
          password: data.password as string | undefined,
        }),
      } as T;
    }
    if (!data.email || !data.fullName || !data.password) {
      throw new Error("Missing fields");
    }
    return {
      user: demoAddUser({
        email: String(data.email),
        fullName: String(data.fullName),
        password: String(data.password),
        role: data.role === "admin" ? "admin" : "staff",
      }),
    } as T;
  }

  if (base === "/api/import" && method === "POST") {
    requireDemoAdmin();
    if (!data.csv || !String(data.csv).trim()) throw new Error("csv text required");
    return demoImportCsv(String(data.csv)) as T;
  }

  throw new Error(`Unknown demo ${method} ${path}`);
}

export async function apiGet<T>(path: string): Promise<T> {
  if (isDemoMode()) return demoGet<T>(path);
  const res = await fetch(path, { credentials: "include", cache: "no-store" });
  return parse<T>(res);
}

export async function apiSend<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  if (isDemoMode()) return demoSend<T>(path, method, body);
  const res = await fetch(path, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return parse<T>(res);
}

/** Browser CSV download that works in demo (no /api) and live modes. */
export async function downloadPnLCsv(month: string) {
  if (isDemoMode()) {
    requireDemoAdmin();
    const pnl = demoComputePnL(month);
    downloadCsv(`pnl-${month}.csv`, pnlToCsv(pnl));
    return;
  }
  const res = await fetch(`/api/pnl?month=${month}&format=csv`, {
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || "Export failed");
  }
  const text = await res.text();
  downloadCsv(`pnl-${month}.csv`, text);
}
