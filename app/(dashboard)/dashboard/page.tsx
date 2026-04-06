import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { AgentActivityFeed } from "@/components/dashboard/agent-activity-feed";
import { PendingActions } from "@/components/dashboard/pending-actions";
import { CashFlowTimeline } from "@/components/dashboard/cash-flow-timeline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const [invoices, projects, recentActivity] = await Promise.all([
    prisma.invoice.findMany({
      where: { userId },
      include: { client: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.project.findMany({
      where: { userId },
      include: { client: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.agentActivity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const stats = {
    totalRevenue: invoices
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + i.amount, 0),
    pendingInvoices: invoices.filter((i) => i.status === "SENT").length,
    activeProjects: projects.filter((p) => p.status === "ACTIVE").length,
    overduePayments: invoices.filter((i) => i.status === "OVERDUE").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500">Your freelance business at a glance</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-zinc-500">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
            <p className="text-xs text-zinc-500">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-zinc-500">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.overduePayments}</div>
            <p className="text-xs text-zinc-500">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent activity + pending actions */}
      <div className="grid grid-cols-2 gap-6">
        <AgentActivityFeed activities={recentActivity} />
        <PendingActions />
      </div>

      {/* Cash flow */}
      <CashFlowTimeline invoices={invoices} />
    </div>
  );
}
