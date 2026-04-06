import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/agent-approvals?status=PENDING&userId=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "PENDING";
  const userId = searchParams.get("userId");

  const where: Record<string, unknown> = { agentType: { in: ["PAYMENT_FOLLOWUP", "ONBOARDING"] } };
  if (userId) where.userId = userId;
  if (status === "PENDING") {
    where.action = "PENDING_APPROVAL";
  } else if (status === "APPROVED") {
    where.action = { in: ["APPROVED", "REMINDER_SENT"] };
  }

  const approvals = await prisma.agentActivity.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Hydrate invoice info for each pending item
  const invoiceIds = approvals.map((a) => a.invoiceId).filter(Boolean) as string[];
  const invoices =
    invoiceIds.length > 0
      ? await prisma.invoice.findMany({
          where: { id: { in: invoiceIds } },
          include: { client: true },
        })
      : [];
  const invoiceMap = Object.fromEntries(invoices.map((i) => [i.id, i]));

  const enriched = approvals.map((a) => ({
    ...a,
    invoice: a.invoiceId ? invoiceMap[a.invoiceId] ?? null : null,
  }));

  return NextResponse.json({ approvals: enriched });
}

// POST /api/agent-approvals — approve or deny
export async function POST(request: Request) {
  const body = await request.json();
  const { invoiceId, approved, userId } = body;

  if (!invoiceId || approved === undefined || !userId) {
    return NextResponse.json({ error: "invoiceId, approved, userId required" }, { status: 400 });
  }

  if (approved) {
    await prisma.agentActivity.create({
      data: {
        userId,
        agentType: "PAYMENT_FOLLOWUP",
        action: "APPROVED",
        invoiceId,
        details: { approvedAt: new Date().toISOString() },
      },
    });
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "OVERDUE" },
    });
    return NextResponse.json({ ok: true, message: "Invoice approved for sending" });
  } else {
    await prisma.agentActivity.create({
      data: {
        userId,
        agentType: "PAYMENT_FOLLOWUP",
        action: "IGNORED",
        invoiceId,
        details: { deniedAt: new Date().toISOString() },
      },
    });
    return NextResponse.json({ ok: true, message: "Invoice marked as ignored" });
  }
}
