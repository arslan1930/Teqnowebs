import type {
  Client,
  Expense,
  LinkStatus,
  LinkTask,
  MonthPnL,
  User,
  UserRole,
} from "./types";

const USERS_KEY = "tw.ops.users";
const CLIENTS_KEY = "tw.ops.clients";
const TASKS_KEY = "tw.ops.tasks";
const EXPENSES_KEY = "tw.ops.expenses";
const SESSION_KEY = "tw.ops.session";

type DemoUser = User & { password: string };

const SEED_USERS: DemoUser[] = [
  {
    id: "admin-1",
    email: "admin@teqnowebs.com",
    fullName: "Office Admin",
    role: "admin",
    active: true,
    password: "ops123",
  },
  {
    id: "staff-1",
    email: "linker@teqnowebs.com",
    fullName: "Ayesha Khan",
    role: "staff",
    active: true,
    password: "ops123",
  },
  {
    id: "staff-2",
    email: "outreach@teqnowebs.com",
    fullName: "Hassan Ali",
    role: "staff",
    active: true,
    password: "ops123",
  },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeed() {
  if (!read<DemoUser[]>(USERS_KEY, []).length) {
    write(
      USERS_KEY,
      SEED_USERS.map(({ password: _p, ...u }) => u),
    );
    write(
      "tw.ops.passwords",
      Object.fromEntries(SEED_USERS.map((u) => [u.id, u.password])),
    );
  }
  if (!read<Client[]>(CLIENTS_KEY, []).length) {
    const month = new Date().toISOString().slice(0, 7);
    const client: Client = {
      id: "client-demo-1",
      name: "Demo Client Co",
      website: "https://democlient.example",
      packageName: "10 links / month",
      monthlyFee: 50000,
      startDate: `${month}-01`,
      active: true,
      notes: "Demo client",
    };
    write(CLIENTS_KEY, [client]);
    const task: LinkTask = {
      id: "task-demo-1",
      clientId: client.id,
      clientName: client.name,
      targetUrl: "https://democlient.example/blog",
      siteDomain: "example-blog.com",
      linkType: "guest_post",
      status: "published",
      liveUrl: "https://example-blog.com/post",
      dr: 42,
      price: 8000,
      cost: 3000,
      assigneeId: "staff-1",
      assigneeName: "Ayesha Khan",
      workMonth: month,
      notes: "Seed task",
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    write(TASKS_KEY, [task]);
  }
}

export function isDemoMode() {
  return process.env.NEXT_PUBLIC_OPS_MODE === "demo";
}

export function demoLogin(email: string, password: string): User {
  ensureSeed();
  const users = read<User[]>(USERS_KEY, []);
  const passwords = read<Record<string, string>>("tw.ops.passwords", {});
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || passwords[user.id] !== password) throw new Error("Invalid email or password");
  if (!user.active) throw new Error("Account deactivated");
  write(SESSION_KEY, user);
  return user;
}

export function demoLogout() {
  localStorage.removeItem(SESSION_KEY);
}

export function demoMe(): User | null {
  ensureSeed();
  return read<User | null>(SESSION_KEY, null);
}

export function demoListClients(): Client[] {
  ensureSeed();
  return read<Client[]>(CLIENTS_KEY, []);
}

export function demoUpsertClient(input: Partial<Client> & { name: string }): Client {
  ensureSeed();
  const list = demoListClients();
  if (input.id) {
    const next = list.map((c) => (c.id === input.id ? { ...c, ...input } : c));
    write(CLIENTS_KEY, next);
    return next.find((c) => c.id === input.id)!;
  }
  const client: Client = {
    id: `client-${Date.now()}`,
    name: input.name,
    website: input.website || null,
    packageName: input.packageName || null,
    monthlyFee: input.monthlyFee || 0,
    startDate: input.startDate || null,
    active: input.active !== false,
    notes: input.notes || null,
  };
  list.push(client);
  write(CLIENTS_KEY, list);
  return client;
}

export function demoListTasks(filters?: {
  clientId?: string;
  status?: string;
  month?: string;
  assigneeId?: string;
  publishedThisMonth?: boolean;
}): LinkTask[] {
  ensureSeed();
  let tasks = read<LinkTask[]>(TASKS_KEY, []);
  const clients = demoListClients();
  const users = read<User[]>(USERS_KEY, []);
  tasks = tasks.map((t) => ({
    ...t,
    clientName: clients.find((c) => c.id === t.clientId)?.name,
    assigneeName: users.find((u) => u.id === t.assigneeId)?.fullName || null,
  }));
  if (filters?.clientId) tasks = tasks.filter((t) => t.clientId === filters.clientId);
  if (filters?.status) tasks = tasks.filter((t) => t.status === filters.status);
  if (filters?.month) tasks = tasks.filter((t) => t.workMonth === filters.month);
  if (filters?.assigneeId) tasks = tasks.filter((t) => t.assigneeId === filters.assigneeId);
  if (filters?.publishedThisMonth) {
    const m = new Date().toISOString().slice(0, 7);
    tasks = tasks.filter(
      (t) => (t.status === "published" || t.status === "live") && t.workMonth === m,
    );
  }
  return tasks.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function demoUpsertTask(
  input: Partial<LinkTask> & { clientId: string; status: LinkStatus; workMonth: string },
): LinkTask {
  ensureSeed();
  const list = read<LinkTask[]>(TASKS_KEY, []);
  const now = new Date().toISOString();
  if (input.id) {
    const next = list.map((t) =>
      t.id === input.id
        ? {
            ...t,
            ...input,
            updatedAt: now,
            publishedAt:
              t.publishedAt ||
              (input.status === "published" || input.status === "live" ? now : null),
          }
        : t,
    );
    write(TASKS_KEY, next);
    return demoListTasks().find((t) => t.id === input.id)!;
  }
  const task: LinkTask = {
    id: `task-${Date.now()}`,
    clientId: input.clientId,
    targetUrl: input.targetUrl || null,
    siteDomain: input.siteDomain || null,
    linkType: input.linkType || null,
    status: input.status,
    liveUrl: input.liveUrl || null,
    dr: input.dr ?? null,
    price: input.price || 0,
    cost: input.cost || 0,
    assigneeId: input.assigneeId || null,
    workMonth: input.workMonth,
    notes: input.notes || null,
    publishedAt:
      input.status === "published" || input.status === "live" ? now : null,
    createdAt: now,
    updatedAt: now,
  };
  list.push(task);
  write(TASKS_KEY, list);
  return demoListTasks().find((t) => t.id === task.id)!;
}

export function demoListUsers(): User[] {
  ensureSeed();
  return read<User[]>(USERS_KEY, []);
}

export function demoAddUser(input: {
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
}): User {
  ensureSeed();
  const users = demoListUsers();
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("Email already exists");
  }
  const user: User = {
    id: `user-${Date.now()}`,
    email: input.email.toLowerCase(),
    fullName: input.fullName,
    role: input.role,
    active: true,
  };
  users.push(user);
  write(USERS_KEY, users);
  const passwords = read<Record<string, string>>("tw.ops.passwords", {});
  passwords[user.id] = input.password;
  write("tw.ops.passwords", passwords);
  return user;
}

export function demoUpdateUser(
  id: string,
  patch: Partial<Pick<User, "fullName" | "role" | "active">> & { password?: string },
): User {
  const users = demoListUsers().map((u) => (u.id === id ? { ...u, ...patch } : u));
  write(USERS_KEY, users);
  if (patch.password) {
    const passwords = read<Record<string, string>>("tw.ops.passwords", {});
    passwords[id] = patch.password;
    write("tw.ops.passwords", passwords);
  }
  return users.find((u) => u.id === id)!;
}

export function demoListExpenses(month?: string): Expense[] {
  const list = read<Expense[]>(EXPENSES_KEY, []);
  return month ? list.filter((e) => e.month === month) : list;
}

export function demoAddExpense(input: {
  month: string;
  amount: number;
  label: string;
  createdBy?: string | null;
}): Expense {
  const list = demoListExpenses();
  const expense: Expense = {
    id: `exp-${Date.now()}`,
    month: input.month,
    amount: input.amount,
    label: input.label,
    createdBy: input.createdBy || null,
    createdAt: new Date().toISOString(),
  };
  list.push(expense);
  write(EXPENSES_KEY, list);
  return expense;
}

export function demoDeleteExpense(id: string) {
  write(
    EXPENSES_KEY,
    demoListExpenses().filter((e) => e.id !== id),
  );
}

export function demoComputePnL(month: string): MonthPnL {
  const billable = demoListTasks({ month }).filter(
    (t) => t.status === "published" || t.status === "live",
  );
  const revenue = billable.reduce((s, t) => s + t.price, 0);
  const taskCosts = billable.reduce((s, t) => s + t.cost, 0);
  const expenses = demoListExpenses(month).reduce((s, e) => s + e.amount, 0);
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
  const byStaff = demoListUsers()
    .filter((u) => u.role === "staff")
    .map((u) => {
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
    byClient: [...byClientMap.values()].map((c) => ({
      ...c,
      profit: c.revenue - c.cost,
    })),
    byStaff,
  };
}

export function demoImportCsv(text: string): { imported: number; errors: string[] } {
  ensureSeed();
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV needs header + rows");
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idx = (name: string) => headers.findIndex((h) => h.includes(name));
  const iClient = idx("client");
  if (iClient < 0) throw new Error('Need a "Client" column');
  let imported = 0;
  const errors: string[] = [];
  for (let r = 1; r < lines.length; r++) {
    try {
      const cols = lines[r].split(",").map((c) => c.trim());
      const clientName = cols[iClient];
      if (!clientName) continue;
      let client = demoListClients().find(
        (c) => c.name.toLowerCase() === clientName.toLowerCase(),
      );
      if (!client) client = demoUpsertClient({ name: clientName });
      const statusRaw = (cols[idx("status")] || "queued").toLowerCase().replace(/\s+/g, "_");
      const status = (
        ["queued", "in_progress", "published", "live", "lost"].includes(statusRaw)
          ? statusRaw
          : "queued"
      ) as LinkStatus;
      const month =
        cols[idx("month")]?.match(/^\d{4}-\d{2}/)?.[0] ||
        new Date().toISOString().slice(0, 7);
      demoUpsertTask({
        clientId: client.id,
        targetUrl: cols[idx("target")] || null,
        siteDomain: cols[idx("site")] || cols[idx("domain")] || null,
        linkType: cols[idx("type")] || null,
        status,
        liveUrl: cols[idx("live")] || null,
        dr: cols[idx("dr")] ? Number(cols[idx("dr")]) : null,
        price: Number(cols[idx("price")] || 0),
        cost: Number(cols[idx("cost")] || 0),
        workMonth: month,
        notes: cols[idx("note")] || null,
      });
      imported++;
    } catch (err) {
      errors.push(`Row ${r + 1}: ${err instanceof Error ? err.message : "fail"}`);
    }
  }
  return { imported, errors };
}
