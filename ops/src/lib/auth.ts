import { dbGetUser } from "./db";
import { getSessionUserId } from "./session";
import type { User } from "./types";

export async function requireUser(): Promise<User | null> {
  const id = await getSessionUserId();
  if (!id) return null;
  const user = dbGetUser(id);
  if (!user || !user.active) return null;
  return user;
}

export async function requireAdmin(): Promise<User | null> {
  const user = await requireUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
