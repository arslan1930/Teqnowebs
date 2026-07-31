import fs from "fs";
import path from "path";
import crypto from "crypto";
import Database from "better-sqlite3";
import type {
  AppSettings,
  Client,
  Expense,
  LinkStatus,
  LinkTask,
  User,
  UserRole,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "ops.db");

let dbSingleton: Database.Database | null = null;

function hashPassword(password: string, salt?: string) {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, s, 32).toString("hex");
  return `${s}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = crypto.scryptSync(password, salt, 32).toString("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(next, "hex"));
  } catch {
    return false;
  }
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
}

export function getDb() {
  if (dbSingleton) return dbSingleton;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','staff')),
      active INTEGER NOT NULL DEFAULT 1,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      website TEXT,
      package_name TEXT,
      monthly_fee REAL NOT NULL DEFAULT 0,
      start_date TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS link_tasks (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      target_url TEXT,
      site_domain TEXT,
      link_type TEXT,
      status TEXT NOT NULL CHECK (status IN ('queued','in_progress','published','live','lost')),
      live_url TEXT,
      dr REAL,
      price REAL NOT NULL DEFAULT 0,
      cost REAL NOT NULL DEFAULT 0,
      assignee_id TEXT,
      work_month TEXT NOT NULL,
      notes TEXT,
      published_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (assignee_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      month TEXT NOT NULL,
      amount REAL NOT NULL,
      label TEXT NOT NULL,
      created_by TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      timezone TEXT NOT NULL,
      currency TEXT NOT NULL
    );
  `);
  seedIfEmpty(db);
  dbSingleton = db;
  return db;
}

function seedIfEmpty(db: Database.Database) {
  const count = (db.prepare("SELECT COUNT(*) AS c FROM users").get() as { c: number }).c;
  if (count > 0) return;
  const now = new Date().toISOString();
  const month = now.slice(0, 7);
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, full_name, role, active, password_hash, created_at)
    VALUES (@id, @email, @full_name, @role, 1, @password_hash, @created_at)
  `);
  const users = [
    { id: "admin-1", email: "admin@teqnowebs.com", full_name: "Office Admin", role: "admin" },
    { id: "staff-1", email: "linker@teqnowebs.com", full_name: "Ayesha Khan", role: "staff" },
    { id: "staff-2", email: "outreach@teqnowebs.com", full_name: "Hassan Ali", role: "staff" },
  ];
  const tx = db.transaction(() => {
    for (const u of users) {
      insertUser.run({
        ...u,
        password_hash: hashPassword("ops123"),
        created_at: now,
      });
    }
    db.prepare(
      `INSERT INTO settings (id, timezone, currency) VALUES (1, 'Asia/Karachi', 'PKR')`,
    ).run();
    const clientId = "client-demo-1";
    db.prepare(
      `INSERT INTO clients (id, name, website, package_name, monthly_fee, start_date, active, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    ).run(
      clientId,
      "Demo Client Co",
      "https://democlient.example",
      "10 links / month",
      50000,
      month + "-01",
      "Sample client for Ops desk",
      now,
    );
    db.prepare(
      `INSERT INTO link_tasks
       (id, client_id, target_url, site_domain, link_type, status, live_url, dr, price, cost, assignee_id, work_month, notes, published_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id("task"),
      clientId,
      "https://democlient.example/blog",
      "example-blog.com",
      "guest_post",
      "published",
      "https://example-blog.com/post",
      42,
      8000,
      3000,
      "staff-1",
      month,
      "Seed published task",
      now,
      now,
      now,
    );
  });
  tx();
}

function mapUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    fullName: row.full_name as string,
    role: row.role as UserRole,
    active: Boolean(row.active),
  };
}

function mapClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    website: (row.website as string | null) ?? null,
    packageName: (row.package_name as string | null) ?? null,
    monthlyFee: Number(row.monthly_fee || 0),
    startDate: (row.start_date as string | null) ?? null,
    active: Boolean(row.active),
    notes: (row.notes as string | null) ?? null,
  };
}

function mapTask(row: Record<string, unknown>): LinkTask {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    clientName: (row.client_name as string) || undefined,
    targetUrl: (row.target_url as string | null) ?? null,
    siteDomain: (row.site_domain as string | null) ?? null,
    linkType: (row.link_type as string | null) ?? null,
    status: row.status as LinkStatus,
    liveUrl: (row.live_url as string | null) ?? null,
    dr: row.dr == null ? null : Number(row.dr),
    price: Number(row.price || 0),
    cost: Number(row.cost || 0),
    assigneeId: (row.assignee_id as string | null) ?? null,
    assigneeName: (row.assignee_name as string | null) ?? null,
    workMonth: row.work_month as string,
    notes: (row.notes as string | null) ?? null,
    publishedAt: (row.published_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function dbLogin(email: string, password: string): User {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM users WHERE lower(email) = lower(?)")
    .get(email.trim()) as Record<string, unknown> | undefined;
  if (!row || !verifyPassword(password, row.password_hash as string)) {
    throw new Error("Invalid email or password");
  }
  if (!row.active) throw new Error("Account deactivated");
  return mapUser(row);
}

export function dbGetUser(id: string): User | null {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapUser(row) : null;
}

export function dbListUsers(): User[] {
  return (
    getDb().prepare("SELECT * FROM users ORDER BY full_name ASC").all() as Record<
      string,
      unknown
    >[]
  ).map(mapUser);
}

export function dbAddUser(input: {
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
}): User {
  const db = getDb();
  const newId = id("user");
  try {
    db.prepare(
      `INSERT INTO users (id, email, full_name, role, active, password_hash, created_at)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
    ).run(
      newId,
      input.email.trim().toLowerCase(),
      input.fullName.trim(),
      input.role,
      hashPassword(input.password),
      new Date().toISOString(),
    );
  } catch {
    throw new Error("Email already exists");
  }
  return dbGetUser(newId)!;
}

export function dbUpdateUser(
  userId: string,
  patch: Partial<Pick<User, "fullName" | "role" | "active">> & { password?: string },
): User {
  const db = getDb();
  const current = dbGetUser(userId);
  if (!current) throw new Error("User not found");
  db.prepare(
    `UPDATE users SET full_name=?, role=?, active=? WHERE id=?`,
  ).run(
    patch.fullName ?? current.fullName,
    patch.role ?? current.role,
    typeof patch.active === "boolean" ? (patch.active ? 1 : 0) : current.active ? 1 : 0,
    userId,
  );
  if (patch.password) {
    db.prepare("UPDATE users SET password_hash=? WHERE id=?").run(
      hashPassword(patch.password),
      userId,
    );
  }
  return dbGetUser(userId)!;
}

export function dbListClients(activeOnly = false): Client[] {
  const sql = activeOnly
    ? "SELECT * FROM clients WHERE active = 1 ORDER BY name ASC"
    : "SELECT * FROM clients ORDER BY name ASC";
  return (getDb().prepare(sql).all() as Record<string, unknown>[]).map(mapClient);
}

export function dbGetClient(id: string): Client | null {
  const row = getDb().prepare("SELECT * FROM clients WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapClient(row) : null;
}

export function dbUpsertClient(input: {
  id?: string;
  name: string;
  website?: string | null;
  packageName?: string | null;
  monthlyFee?: number;
  startDate?: string | null;
  active?: boolean;
  notes?: string | null;
}): Client {
  const db = getDb();
  const now = new Date().toISOString();
  if (input.id) {
    const cur = dbGetClient(input.id);
    if (!cur) throw new Error("Client not found");
    db.prepare(
      `UPDATE clients SET name=?, website=?, package_name=?, monthly_fee=?, start_date=?, active=?, notes=? WHERE id=?`,
    ).run(
      input.name,
      input.website ?? cur.website,
      input.packageName ?? cur.packageName,
      input.monthlyFee ?? cur.monthlyFee,
      input.startDate ?? cur.startDate,
      typeof input.active === "boolean" ? (input.active ? 1 : 0) : cur.active ? 1 : 0,
      input.notes ?? cur.notes,
      input.id,
    );
    return dbGetClient(input.id)!;
  }
  const newId = id("client");
  db.prepare(
    `INSERT INTO clients (id, name, website, package_name, monthly_fee, start_date, active, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    newId,
    input.name.trim(),
    input.website || null,
    input.packageName || null,
    input.monthlyFee || 0,
    input.startDate || null,
    input.active === false ? 0 : 1,
    input.notes || null,
    now,
  );
  return dbGetClient(newId)!;
}

export function dbListTasks(filters?: {
  clientId?: string;
  status?: string;
  month?: string;
  assigneeId?: string;
  publishedThisMonth?: boolean;
}): LinkTask[] {
  const db = getDb();
  const where: string[] = [];
  const params: unknown[] = [];
  if (filters?.clientId) {
    where.push("t.client_id = ?");
    params.push(filters.clientId);
  }
  if (filters?.status) {
    where.push("t.status = ?");
    params.push(filters.status);
  }
  if (filters?.month) {
    where.push("t.work_month = ?");
    params.push(filters.month);
  }
  if (filters?.assigneeId) {
    where.push("t.assignee_id = ?");
    params.push(filters.assigneeId);
  }
  if (filters?.publishedThisMonth) {
    const month = new Date().toISOString().slice(0, 7);
    where.push("t.status IN ('published','live') AND t.work_month = ?");
    params.push(month);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = db
    .prepare(
      `SELECT t.*, c.name AS client_name, u.full_name AS assignee_name
       FROM link_tasks t
       LEFT JOIN clients c ON c.id = t.client_id
       LEFT JOIN users u ON u.id = t.assignee_id
       ${clause}
       ORDER BY t.updated_at DESC
       LIMIT 2000`,
    )
    .all(...params) as Record<string, unknown>[];
  return rows.map(mapTask);
}

export function dbGetTask(taskId: string): LinkTask | null {
  const row = getDb()
    .prepare(
      `SELECT t.*, c.name AS client_name, u.full_name AS assignee_name
       FROM link_tasks t
       LEFT JOIN clients c ON c.id = t.client_id
       LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.id = ?`,
    )
    .get(taskId) as Record<string, unknown> | undefined;
  return row ? mapTask(row) : null;
}

export function dbUpsertTask(input: {
  id?: string;
  clientId: string;
  targetUrl?: string | null;
  siteDomain?: string | null;
  linkType?: string | null;
  status: LinkStatus;
  liveUrl?: string | null;
  dr?: number | null;
  price?: number;
  cost?: number;
  assigneeId?: string | null;
  workMonth: string;
  notes?: string | null;
}): LinkTask {
  const db = getDb();
  const now = new Date().toISOString();
  const published =
    input.status === "published" || input.status === "live" ? now : null;
  if (input.id) {
    const cur = dbGetTask(input.id);
    if (!cur) throw new Error("Task not found");
    const keepPublished =
      cur.publishedAt ||
      (input.status === "published" || input.status === "live" ? published : null);
    db.prepare(
      `UPDATE link_tasks SET
        client_id=?, target_url=?, site_domain=?, link_type=?, status=?, live_url=?,
        dr=?, price=?, cost=?, assignee_id=?, work_month=?, notes=?, published_at=?, updated_at=?
       WHERE id=?`,
    ).run(
      input.clientId,
      input.targetUrl ?? cur.targetUrl,
      input.siteDomain ?? cur.siteDomain,
      input.linkType ?? cur.linkType,
      input.status,
      input.liveUrl ?? cur.liveUrl,
      input.dr ?? cur.dr,
      input.price ?? cur.price,
      input.cost ?? cur.cost,
      input.assigneeId === undefined ? cur.assigneeId : input.assigneeId,
      input.workMonth,
      input.notes ?? cur.notes,
      keepPublished,
      now,
      input.id,
    );
    return dbGetTask(input.id)!;
  }
  const newId = id("task");
  db.prepare(
    `INSERT INTO link_tasks
     (id, client_id, target_url, site_domain, link_type, status, live_url, dr, price, cost, assignee_id, work_month, notes, published_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    newId,
    input.clientId,
    input.targetUrl || null,
    input.siteDomain || null,
    input.linkType || null,
    input.status,
    input.liveUrl || null,
    input.dr ?? null,
    input.price || 0,
    input.cost || 0,
    input.assigneeId || null,
    input.workMonth,
    input.notes || null,
    published,
    now,
    now,
  );
  return dbGetTask(newId)!;
}

export function dbDeleteTask(taskId: string) {
  const r = getDb().prepare("DELETE FROM link_tasks WHERE id = ?").run(taskId);
  if (!r.changes) throw new Error("Task not found");
}

export function dbListExpenses(month?: string): Expense[] {
  const rows = (
    month
      ? getDb()
          .prepare("SELECT * FROM expenses WHERE month = ? ORDER BY created_at DESC")
          .all(month)
      : getDb().prepare("SELECT * FROM expenses ORDER BY month DESC, created_at DESC").all()
  ) as Record<string, unknown>[];
  return rows.map((r) => ({
    id: r.id as string,
    month: r.month as string,
    amount: Number(r.amount),
    label: r.label as string,
    createdBy: (r.created_by as string | null) ?? null,
    createdAt: r.created_at as string,
  }));
}

export function dbAddExpense(input: {
  month: string;
  amount: number;
  label: string;
  createdBy?: string | null;
}): Expense {
  const newId = id("exp");
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO expenses (id, month, amount, label, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(newId, input.month, input.amount, input.label, input.createdBy || null, now);
  return dbListExpenses().find((e) => e.id === newId)!;
}

export function dbDeleteExpense(expenseId: string) {
  getDb().prepare("DELETE FROM expenses WHERE id = ?").run(expenseId);
}

export function dbGetSettings(): AppSettings {
  const row = getDb().prepare("SELECT * FROM settings WHERE id = 1").get() as
    | Record<string, unknown>
    | undefined;
  return {
    timezone: (row?.timezone as string) || "Asia/Karachi",
    currency: (row?.currency as string) || "PKR",
  };
}

export function dbFindClientByName(name: string): Client | null {
  const row = getDb()
    .prepare("SELECT * FROM clients WHERE lower(name) = lower(?)")
    .get(name.trim()) as Record<string, unknown> | undefined;
  return row ? mapClient(row) : null;
}

export function dbFindUserByEmail(email: string): User | null {
  const row = getDb()
    .prepare("SELECT * FROM users WHERE lower(email) = lower(?)")
    .get(email.trim()) as Record<string, unknown> | undefined;
  return row ? mapUser(row) : null;
}
