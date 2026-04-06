import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentFollowUpAgent } from "@/agents/payment-followup";

export const runtime = "nodejs";
export const maxDuration = 60;

// GET /api/cron/agents — triggered by OpenClaw cron or external service
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all users with active subscriptions or in demo mode
    const users = await prisma.user.findMany();
    const results = [];

    for (const user of users) {
      const agent = new PaymentFollowUpAgent(user.id);
      const overdue = await agent.checkOverdueInvoices();

      if (overdue.length > 0) {
        results.push({ userId: user.id, overdueInvoices: overdue });
      }
    }

    return NextResponse.json({
      ok: true,
      usersChecked: users.length,
      withOverdue: results.length,
      details: results,
    });
  } catch (err) {
    console.error("Agent cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
