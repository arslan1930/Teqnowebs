import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { importLinkCsv } from "@/lib/import-map";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  try {
    const body = (await req.json()) as { csv?: string };
    if (!body.csv?.trim()) {
      return NextResponse.json({ error: "csv text required" }, { status: 400 });
    }
    const result = importLinkCsv(body.csv);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Import failed" },
      { status: 400 },
    );
  }
}
