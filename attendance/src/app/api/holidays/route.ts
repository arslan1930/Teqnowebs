import { NextResponse } from "next/server";
import { dbAddHoliday, dbGetProfile, dbListHolidays, dbRemoveHoliday } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ holidays: dbListHolidays() });
}

export async function POST(req: Request) {
  const uid = await getSessionUserId();
  const me = uid ? dbGetProfile(uid) : null;
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  try {
    const body = (await req.json()) as { date?: string; title?: string; note?: string; id?: string; action?: string };
    if (body.action === "remove" && body.id) {
      dbRemoveHoliday(body.id);
      return NextResponse.json({ ok: true });
    }
    if (!body.date || !body.title) {
      return NextResponse.json({ error: "Date and title required" }, { status: 400 });
    }
    const holiday = dbAddHoliday({ date: body.date, title: body.title, note: body.note });
    return NextResponse.json({ holiday });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Holiday error" },
      { status: 400 },
    );
  }
}
