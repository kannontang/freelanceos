import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const hasAuth = !!process.env.AUTH_SECRET;

async function getUserId(): Promise<string | null> {
  if (!hasAuth) {
    const demoUser = await prisma.user.findFirst();
    return demoUser?.id ?? null;
  }
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user?.id ?? null;
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user data
    const [user, clients, projects, invoices, integrations, complianceAlerts, agentActivities] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.client.findMany({ where: { userId } }),
      prisma.project.findMany({ where: { userId } }),
      prisma.invoice.findMany({ where: { userId } }),
      prisma.integration.findMany({ where: { userId } }),
      prisma.complianceAlert.findMany({ where: { userId } }),
      prisma.agentActivity.findMany({ where: { userId } }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        timezone: user?.timezone,
        currency: user?.currency,
        hourlyRate: user?.hourlyRate,
        createdAt: user?.createdAt,
      },
      clients,
      projects,
      invoices,
      integrations,
      complianceAlerts,
      agentActivities,
    };

    return NextResponse.json(exportData, {
      headers: {
        "Content-Disposition": `attachment; filename="freelanceos-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}