import fs from "fs";
import path from "path";
import crypto from "crypto";
import Database from "better-sqlite3";
import { partsInTz } from "./dates";
import type {
  AppSettings,
  AttendanceEvent,
  AttendanceEventType,
  CompanyHoliday,
  LeaveRequest,
  LeaveStatus,
  OfficeTiming,
  StaffGroup,
  StaffProfile,
  StaffRole,
} from "./types";
import { DEFAULT_TIMEZONE } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "attendance.db");

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
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(next, "hex"));
}

export function getDb() {
  if (dbSingleton) return dbSingleton;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff_profiles (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','staff')),
      staff_group TEXT NOT NULL CHECK (staff_group IN ('female','male')),
      active INTEGER NOT NULL DEFAULT 1,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendance_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('check_in','check_out')),
      note TEXT,
      client_ip TEXT,
      is_manual INTEGER NOT NULL DEFAULT 0,
      edited_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES staff_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS office_timings (
      staff_group TEXT PRIMARY KEY CHECK (staff_group IN ('female','male')),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      late_after_minutes INTEGER NOT NULL DEFAULT 15
    );

    CREATE TABLE IF NOT EXISTS company_holidays (
      id TEXT PRIMARY KEY,
      holiday_date TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leave_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      leave_date TEXT NOT NULL,
      reason TEXT,
      status TEXT NOT NULL CHECK (status IN ('pending','approved','rejected')),
      created_at TEXT NOT NULL,
      UNIQUE(user_id, leave_date),
      FOREIGN KEY (user_id) REFERENCES staff_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      timezone TEXT NOT NULL,
      allowed_ips TEXT NOT NULL
    );
  `);

  seedIfEmpty(db);
  dbSingleton = db;
  return db;
}

function seedIfEmpty(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) AS c FROM staff_profiles").get() as { c: number };
  if (count.c > 0) return;

  const now = new Date().toISOString();
  const insertUser = db.prepare(`
    INSERT INTO staff_profiles (id, email, full_name, role, staff_group, active, password_hash, created_at)
    VALUES (@id, @email, @full_name, @role, @staff_group, 1, @password_hash, @created_at)
  `);

  // Admin does NOT mark attendance. Only role=staff appear on roster.
  const users = [
    {
      id: "admin-1",
      email: "admin@teqnowebs.com",
      full_name: "Office Admin",
      role: "admin",
      staff_group: "male",
    },
    {
      id: "staff-f-1",
      email: "staff@teqnowebs.com",
      full_name: "Ayesha Khan",
      role: "staff",
      staff_group: "female",
    },
    {
      id: "staff-f-2",
      email: "sara@teqnowebs.com",
      full_name: "Sara Ahmed",
      role: "staff",
      staff_group: "female",
    },
    {
      id: "staff-f-3",
      email: "fatima@teqnowebs.com",
      full_name: "Fatima Noor",
      role: "staff",
      staff_group: "female",
    },
    {
      id: "staff-m-1",
      email: "hr@teqnowebs.com",
      full_name: "Hassan Ali",
      role: "staff",
      staff_group: "male",
    },
    {
      id: "staff-m-2",
      email: "bilal@teqnowebs.com",
      full_name: "Bilal Raza",
      role: "staff",
      staff_group: "male",
    },
    {
      id: "staff-m-3",
      email: "umar@teqnowebs.com",
      full_name: "Umar Siddiqui",
      role: "staff",
      staff_group: "male",
    },
    {
      id: "staff-m-4",
      email: "zain@teqnowebs.com",
      full_name: "Zain Malik",
      role: "staff",
      staff_group: "male",
    },
  ];

  const tx = db.transaction(() => {
    for (const u of users) {
      insertUser.run({
        ...u,
        password_hash: hashPassword("attendance123"),
        created_at: now,
      });
    }
    db.prepare(
      `INSERT INTO office_timings (staff_group, start_time, end_time, late_after_minutes) VALUES
       ('female','09:00','17:00',15), ('male','09:00','18:00',15)`,
    ).run();
    db.prepare(
      `INSERT INTO app_settings (id, timezone, allowed_ips) VALUES (1, ?, ?)`,
    ).run(DEFAULT_TIMEZONE, "[]");
  });
  tx();
}

function mapProfile(row: Record<string, unknown>): StaffProfile {
  return {
    id: row.id as string,
    email: row.email as string,
    fullName: row.full_name as string,
    role: row.role as StaffRole,
    staffGroup: row.staff_group as StaffGroup,
    active: Boolean(row.active),
  };
}

export function dbLogin(email: string, password: string): StaffProfile {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM staff_profiles WHERE lower(email) = lower(?)")
    .get(email.trim()) as Record<string, unknown> | undefined;
  if (!row || !verifyPassword(password, row.password_hash as string)) {
    throw new Error("Invalid email or password");
  }
  if (!row.active) throw new Error("This account is deactivated. Contact admin.");
  return mapProfile(row);
}

export function dbGetProfile(id: string): StaffProfile | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM staff_profiles WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapProfile(row) : null;
}

export function dbListProfiles(): StaffProfile[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM staff_profiles ORDER BY full_name ASC")
    .all() as Record<string, unknown>[];
  return rows.map(mapProfile);
}

/** Staff who mark attendance (admins excluded). */
export function dbListAttendanceStaff(): StaffProfile[] {
  return dbListProfiles().filter((p) => p.role === "staff" && p.active);
}

export function dbUpdateProfile(
  userId: string,
  patch: Partial<Pick<StaffProfile, "role" | "staffGroup" | "fullName" | "active">>,
): StaffProfile {
  const db = getDb();
  const current = dbGetProfile(userId);
  if (!current) throw new Error("Profile not found");
  const next = {
    full_name: patch.fullName ?? current.fullName,
    role: patch.role ?? current.role,
    staff_group: patch.staffGroup ?? current.staffGroup,
    active: typeof patch.active === "boolean" ? (patch.active ? 1 : 0) : current.active ? 1 : 0,
  };
  db.prepare(
    `UPDATE staff_profiles SET full_name=@full_name, role=@role, staff_group=@staff_group, active=@active WHERE id=@id`,
  ).run({ ...next, id: userId });
  return dbGetProfile(userId)!;
}

export function dbAddStaff(input: {
  fullName: string;
  email: string;
  password: string;
  staffGroup: StaffGroup;
  role?: StaffRole;
}): StaffProfile {
  const db = getDb();
  const role = input.role || "staff";
  if (role === "staff") {
    const staffCount = (
      db.prepare("SELECT COUNT(*) AS c FROM staff_profiles WHERE role='staff'").get() as {
        c: number;
      }
    ).c;
    if (staffCount >= 15) throw new Error("Seat limit reached (15 staff)");
  }
  const id = `user-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  try {
    db.prepare(
      `INSERT INTO staff_profiles (id, email, full_name, role, staff_group, active, password_hash, created_at)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
    ).run(
      id,
      input.email.trim().toLowerCase(),
      input.fullName.trim(),
      role,
      input.staffGroup,
      hashPassword(input.password),
      new Date().toISOString(),
    );
  } catch {
    throw new Error("A staff member with that email already exists");
  }
  return dbGetProfile(id)!;
}

export function dbResetPassword(userId: string, password: string) {
  const db = getDb();
  const r = db
    .prepare("UPDATE staff_profiles SET password_hash = ? WHERE id = ?")
    .run(hashPassword(password), userId);
  if (!r.changes) throw new Error("Profile not found");
}

export function dbListEvents(userId?: string): AttendanceEvent[] {
  const db = getDb();
  const rows = (
    userId
      ? db
          .prepare(
            "SELECT * FROM attendance_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 2000",
          )
          .all(userId)
      : db
          .prepare("SELECT * FROM attendance_events ORDER BY created_at DESC LIMIT 2000")
          .all()
  ) as Record<string, unknown>[];
  return rows.map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as AttendanceEventType,
    createdAt: row.created_at as string,
    note: (row.note as string | null) ?? null,
    clientIp: (row.client_ip as string | null) ?? null,
    isManual: Boolean(row.is_manual),
    editedBy: (row.edited_by as string | null) ?? null,
  }));
}

export function dbInsertEvent(input: {
  userId: string;
  type: AttendanceEventType;
  note?: string | null;
  clientIp?: string | null;
  isManual?: boolean;
  editedBy?: string | null;
  createdAt?: string;
}): AttendanceEvent {
  const db = getDb();
  const id = `evt-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  const createdAt = input.createdAt || new Date().toISOString();
  db.prepare(
    `INSERT INTO attendance_events (id, user_id, type, note, client_ip, is_manual, edited_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.userId,
    input.type,
    input.note ?? null,
    input.clientIp ?? null,
    input.isManual ? 1 : 0,
    input.editedBy ?? null,
    createdAt,
  );
  return {
    id,
    userId: input.userId,
    type: input.type,
    createdAt,
    note: input.note ?? null,
    clientIp: input.clientIp ?? null,
    isManual: Boolean(input.isManual),
    editedBy: input.editedBy ?? null,
  };
}

export function dbDeleteEventsForUserDate(userId: string, dateStr: string, timeZone: string) {
  const events = dbListEvents(userId);
  const db = getDb();
  const del = db.prepare("DELETE FROM attendance_events WHERE id = ?");
  for (const e of events) {
    if (partsInTz(new Date(e.createdAt), timeZone).dateStr === dateStr) {
      del.run(e.id);
    }
  }
}

export function dbListTimings(): OfficeTiming[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM office_timings").all() as Record<string, unknown>[];
  return rows.map((r) => ({
    staffGroup: r.staff_group as StaffGroup,
    startTime: String(r.start_time).slice(0, 5),
    endTime: String(r.end_time).slice(0, 5),
    lateAfterMinutes: Number(r.late_after_minutes),
  }));
}

export function dbSaveTiming(timing: OfficeTiming): OfficeTiming {
  const db = getDb();
  db.prepare(
    `INSERT INTO office_timings (staff_group, start_time, end_time, late_after_minutes)
     VALUES (@staffGroup, @startTime, @endTime, @lateAfterMinutes)
     ON CONFLICT(staff_group) DO UPDATE SET
       start_time=excluded.start_time,
       end_time=excluded.end_time,
       late_after_minutes=excluded.late_after_minutes`,
  ).run(timing);
  return timing;
}

export function dbListHolidays(): CompanyHoliday[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM company_holidays ORDER BY holiday_date ASC")
    .all() as Record<string, unknown>[];
  return rows.map((r) => ({
    id: r.id as string,
    date: r.holiday_date as string,
    title: r.title as string,
    note: (r.note as string | null) ?? null,
  }));
}

export function dbAddHoliday(input: {
  date: string;
  title: string;
  note?: string;
}): CompanyHoliday {
  const db = getDb();
  const id = `hol-${Date.now()}`;
  try {
    db.prepare(
      `INSERT INTO company_holidays (id, holiday_date, title, note, created_at) VALUES (?, ?, ?, ?, ?)`,
    ).run(id, input.date, input.title, input.note || null, new Date().toISOString());
  } catch {
    throw new Error("A holiday is already announced for that date");
  }
  return { id, date: input.date, title: input.title, note: input.note || null };
}

export function dbRemoveHoliday(id: string) {
  getDb().prepare("DELETE FROM company_holidays WHERE id = ?").run(id);
}

export function dbListLeaves(userId?: string): LeaveRequest[] {
  const db = getDb();
  const rows = (
    userId
      ? db
          .prepare(
            `SELECT l.*, p.full_name FROM leave_requests l
             LEFT JOIN staff_profiles p ON p.id = l.user_id
             WHERE l.user_id = ? ORDER BY l.leave_date DESC`,
          )
          .all(userId)
      : db
          .prepare(
            `SELECT l.*, p.full_name FROM leave_requests l
             LEFT JOIN staff_profiles p ON p.id = l.user_id
             ORDER BY l.leave_date DESC`,
          )
          .all()
  ) as Record<string, unknown>[];
  return rows.map((r) => ({
    id: r.id as string,
    userId: r.user_id as string,
    userName: (r.full_name as string) || undefined,
    date: r.leave_date as string,
    reason: (r.reason as string | null) ?? null,
    status: r.status as LeaveStatus,
    createdAt: r.created_at as string,
  }));
}

export function dbRequestLeave(userId: string, date: string, reason?: string): LeaveRequest {
  const db = getDb();
  const profile = dbGetProfile(userId);
  if (!profile || profile.role !== "staff") {
    throw new Error("Only staff can request personal leave");
  }
  const month = date.slice(0, 7);
  const used = (
    db
      .prepare(
        `SELECT COUNT(*) AS c FROM leave_requests
         WHERE user_id = ? AND status IN ('approved','pending') AND substr(leave_date,1,7) = ?`,
      )
      .get(userId, month) as { c: number }
  ).c;
  if (used >= 1) throw new Error("Only 1 personal leave is allowed per month");
  const id = `leave-${Date.now()}`;
  try {
    db.prepare(
      `INSERT INTO leave_requests (id, user_id, leave_date, reason, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
    ).run(id, userId, date, reason || null, new Date().toISOString());
  } catch {
    throw new Error("You already have a leave request for that date");
  }
  return dbListLeaves(userId).find((l) => l.id === id)!;
}

export function dbReviewLeave(id: string, status: "approved" | "rejected"): LeaveRequest {
  const db = getDb();
  const current = db.prepare("SELECT * FROM leave_requests WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
  if (!current) throw new Error("Leave request not found");
  if (status === "approved") {
    const month = String(current.leave_date).slice(0, 7);
    const used = (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM leave_requests
           WHERE user_id = ? AND status = 'approved' AND substr(leave_date,1,7) = ? AND id != ?`,
        )
        .get(current.user_id, month, id) as { c: number }
    ).c;
    if (used >= 1) {
      throw new Error("This staff member already has 1 approved leave this month");
    }
  }
  db.prepare("UPDATE leave_requests SET status = ? WHERE id = ?").run(status, id);
  return dbListLeaves().find((l) => l.id === id)!;
}

export function dbGetSettings(): AppSettings {
  const db = getDb();
  const row = db.prepare("SELECT * FROM app_settings WHERE id = 1").get() as
    | Record<string, unknown>
    | undefined;
  if (!row) return { timezone: DEFAULT_TIMEZONE, allowedIps: [] };
  let allowedIps: string[] = [];
  try {
    allowedIps = JSON.parse(String(row.allowed_ips || "[]")) as string[];
  } catch {
    allowedIps = [];
  }
  return {
    timezone: (row.timezone as string) || DEFAULT_TIMEZONE,
    allowedIps,
  };
}

export function dbSaveSettings(settings: AppSettings): AppSettings {
  const db = getDb();
  db.prepare(
    `INSERT INTO app_settings (id, timezone, allowed_ips) VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET timezone=excluded.timezone, allowed_ips=excluded.allowed_ips`,
  ).run(settings.timezone, JSON.stringify(settings.allowedIps));
  return settings;
}
