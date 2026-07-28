import { NextResponse } from "next/server";
import {
  dbGetProfile,
  dbGetSettings,
  dbInsertEvent,
  dbListEvents,
  dbListHolidays,
  dbListLeaves,
} from "@/lib/db";
import { minutesSinceMidnightInTz, partsInTz, todayDateStr } from "@/lib/dates";
import { checkoutBlockedReason, isHalfLeaveCheckout } from "@/lib/rules";
import { getSessionUserId } from "@/lib/session";
import { approvedLeaveOnDate, holidayOnDate } from "@/lib/status";
import { DEFAULT_TIMEZONE } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = dbGetProfile(uid);
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || undefined;
  if (userId && me.role !== "admin" && userId !== me.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const events = dbListEvents(me.role === "admin" ? userId : me.id);
  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  try {
    const uid = await getSessionUserId();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = dbGetProfile(uid);
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (me.role === "admin") {
      return NextResponse.json(
        { error: "Admins do not mark attendance. Use the admin panel only." },
        { status: 403 },
      );
    }

    const body = (await req.json()) as { type?: "check_in" | "check_out"; note?: string };
    if (body.type !== "check_in" && body.type !== "check_out") {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const settings = dbGetSettings();
    const tz = settings.timezone || DEFAULT_TIMEZONE;
    const dateStr = todayDateStr(tz);
    if (holidayOnDate(dbListHolidays(), dateStr)) {
      return NextResponse.json(
        { error: "Today is a company holiday — no attendance required" },
        { status: 400 },
      );
    }
    if (approvedLeaveOnDate(dbListLeaves(me.id), dateStr)) {
      return NextResponse.json({ error: "You are on approved leave today" }, { status: 400 });
    }

    const existing = dbListEvents(me.id);
    const todays = existing.filter(
      (e) => partsInTz(new Date(e.createdAt), tz).dateStr === dateStr,
    );
    if (body.type === "check_in" && todays.some((e) => e.type === "check_in")) {
      return NextResponse.json({ error: "Already checked in today." }, { status: 400 });
    }
    if (body.type === "check_out") {
      if (!todays.some((e) => e.type === "check_in")) {
        return NextResponse.json({ error: "Check in first before checking out." }, { status: 400 });
      }
      if (todays.some((e) => e.type === "check_out")) {
        return NextResponse.json({ error: "Already checked out today." }, { status: 400 });
      }
      const nowMins = minutesSinceMidnightInTz(new Date(), tz);
      const blocked = checkoutBlockedReason(nowMins);
      if (blocked) return NextResponse.json({ error: blocked }, { status: 400 });
    }

    let note = body.note || null;
    if (body.type === "check_out") {
      const nowMins = minutesSinceMidnightInTz(new Date(), tz);
      if (isHalfLeaveCheckout(nowMins)) {
        note = note ? `${note} · Half leave (checkout 3–4pm)` : "Half leave (checkout 3–4pm)";
      }
    }

    const event = dbInsertEvent({
      userId: me.id,
      type: body.type,
      note,
      clientIp: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    });
    return NextResponse.json({ event });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not mark attendance" },
      { status: 500 },
    );
  }
}
