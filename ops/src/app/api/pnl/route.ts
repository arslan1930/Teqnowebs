import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { currentMonth } from "@/lib/format";
import { computeMonthPnL, pnlToCsv } from "@/lib/pnl";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const url = new URL(req.url);
  const month = url.searchParams.get("month") || currentMonth();
  const pnl = computeMonthPnL(month);
  if (url.searchParams.get("format") === "csv") {
    return new NextResponse(pnlToCsv(pnl), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="pnl-${month}.csv"`,
      },
    });
  }
  return NextResponse.json({ pnl });
}
