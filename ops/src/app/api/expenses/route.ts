import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { dbAddExpense, dbDeleteExpense, dbListExpenses } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const month = new URL(req.url).searchParams.get("month") || undefined;
  return NextResponse.json({ expenses: dbListExpenses(month) });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  try {
    const body = (await req.json()) as {
      month?: string;
      amount?: number;
      label?: string;
      action?: string;
      id?: string;
    };
    if (body.action === "delete" && body.id) {
      dbDeleteExpense(body.id);
      return NextResponse.json({ ok: true });
    }
    if (!body.month || body.amount == null || !body.label) {
      return NextResponse.json({ error: "month, amount, label required" }, { status: 400 });
    }
    const expense = dbAddExpense({
      month: body.month,
      amount: Number(body.amount),
      label: body.label,
      createdBy: admin.id,
    });
    return NextResponse.json({ expense });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 400 },
    );
  }
}
