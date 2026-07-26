import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "tw_att_session";
const SECRET = process.env.ATTENDANCE_SESSION_SECRET || "teqnowebs-office-attendance-dev";

function sign(value: string) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function encodeSession(userId: string) {
  const payload = `${userId}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, ts, sig] = parts;
  const payload = `${userId}.${ts}`;
  if (sign(payload) !== sig) return null;
  // 30 days
  if (Date.now() - Number(ts) > 30 * 24 * 60 * 60 * 1000) return null;
  return userId;
}

export async function setSessionCookie(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE, encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  return decodeSession(jar.get(COOKIE)?.value);
}
