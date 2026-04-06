import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/agent-approvals — list pending/approved
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "PENDING";
  const userId = searchParams.get("userId");

  const where: Record<string, unknown> = { type: { in: ["PAYMENT_FOLLOWUP", "ONBOARDING"] } };
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
    include: { invoice: { include: { client: true } } },
  });

  return NextResponse.json({ approvals });
}

// POST /api/agent-approvals — approve or deny
export async function POST(request: Request) {
  const body = await request.json();
  const { invoiceId, approved, userId } = body;

  if (!invoiceId || approved === undefined || !userId) {
    return NextResponse.json({ error: "invoiceId, approved, userId required" }, { status: 400 });
  }

  if (approved) {
    // Upsert: mark invoice approved, log APPROVED activity
    await prisma.agentActivity.create({
      data: {
        userId,
        type: "PAYMENT_FOLLOWUP",
        action: "APPROVED",
        invoiceId,
        metadata: { approvedAt: new Date().toISOString() },
      },
    });

    // Update invoice status back to ESCALATION so agent picks it up next run
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "OVERDUE" },
    });

    return NextResponse.json({ ok: true, message: "Invoice approved for sending" });
  } else {
    // Denied: log and mark invoice as IGNORED
    await prisma.agentActivity.create({
      data: {
        userId,
        type: "PAYMENT_FOLLOWUP",
        action: "IGNORED",
        invoiceId,
        metadata: { deniedAt: new Date().toISOString() },
      },
    });

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "OVERDUE" },
    });

    return NextResponse.json({ ok: true, message: "Invoice marked as ignored" });
  }
}
