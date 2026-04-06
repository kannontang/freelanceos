import { prisma } from "@/lib/prisma";
import { AgentActivityFeed } from "@/components/dashboard/agent-activity-feed";
import { PendingActions } from "@/components/dashboard/pending-actions";
import { CashFlowTimeline } from "@/components/dashboard/cash-flow-timeline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const hasClerk = process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.includes("placeholder");

async function getAuthUserId(): Promise<string | null> {
  if (!hasClerk) return null;
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const clerkUserId = await getAuthUserId();

  // If no Clerk, load demo user's data; otherwise load by Clerk user's DB id
  let userId: string | undefined;
  if (clerkUserId) {
    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    userId = user?.id;
  } else {
    // Demo mode: grab first user
    const demoUser = await prisma.user.findFirst();
    userId = demoUser?.id;
  }

  const [invoices, projects, recentActivity, pendingFollowUps, complianceAlerts] = await Promise.all([
    prisma.invoice.findMany({
      where: userId ? { userId } : {},
      include: { client: true, project: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.project.findMany({
      where: userId ? { userId } : {},
      include: { client: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.agentActivity.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.paymentFollowUp.findMany({
      where: userId
        ? { invoice: { userId } }
        : {},
      include: { invoice: { include: { client: true } } },
      orderBy: { sentAt: "desc" },
      take: 5,
    }),
    prisma.complianceAlert.findMany({
      where: {
        ...(userId ? { userId } : {}),
        dismissed: false,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
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

  const invoiceStatusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    DRAFT: "secondary",
    SENT: "default",
    PAID: "success",
    OVERDUE: "destructive",
    CANCELLED: "secondary",
  };

  return (
    <div className="p-6 space-y-6">
      {!hasClerk && (
        <div className="rounded-lg border border-yellow-800 bg-yellow-950/50 p-4">
          <p className="text-sm text-yellow-300">
            <strong>Demo Mode</strong> — Connect Clerk to see real authenticated data.
            Set <code className="bg-yellow-900/50 px-1 rounded">CLERK_SECRET_KEY</code> in your <code className="bg-yellow-900/50 px-1 rounded">.env</code> file.
          </p>
        </div>
      )}

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
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
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

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-zinc-400">Recent Invoices</CardTitle>
            <Link href="/invoices" className="text-xs text-blue-400 hover:underline">View all</Link>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-zinc-600">No invoices yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-2 text-left font-medium">Invoice</th>
                  <th className="pb-2 text-left font-medium">Client</th>
                  <th className="pb-2 text-left font-medium">Project</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                  <th className="pb-2 text-right font-medium">Due</th>
                  <th className="pb-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="border-b border-zinc-800/50">
                    <td className="py-2">
                      <Link href={`/invoices/${inv.id}`} className="text-blue-400 hover:underline">
                        {inv.number}
                      </Link>
                    </td>
                    <td className="py-2 text-zinc-300">
                      <Link href={`/clients/${inv.clientId}`} className="hover:underline">
                        {inv.client.name}
                      </Link>
                    </td>
                    <td className="py-2 text-zinc-400">{inv.project?.name ?? "—"}</td>
                    <td className="py-2 text-right text-white">{formatCurrency(inv.amount, inv.currency)}</td>
                    <td className="py-2 text-right text-zinc-400">{formatDate(inv.dueDate)}</td>
                    <td className="py-2 text-right">
                      <Badge variant={invoiceStatusVariant[inv.status] ?? "default"}>{inv.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Agent activity + pending actions */}
      <div className="grid grid-cols-2 gap-6">
        <AgentActivityFeed activities={recentActivity as React.ComponentProps<typeof AgentActivityFeed>["activities"]} />
        <PendingActions />
      </div>

      {/* Compliance Alerts */}
      {complianceAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-400">Compliance Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {complianceAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded border p-3 ${
                  alert.severity === "CRITICAL"
                    ? "border-red-800 bg-red-950/30"
                    : alert.severity === "WARNING"
                    ? "border-yellow-800 bg-yellow-950/30"
                    : "border-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{alert.title}</span>
                  <Badge variant={alert.severity === "CRITICAL" ? "destructive" : alert.severity === "WARNING" ? "warning" : "secondary"}>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400">{alert.description}</p>
                <div className="flex gap-2 mt-1 text-xs text-zinc-500">
                  <span>{alert.region}</span>
                  {alert.regulation && <span>· {alert.regulation}</span>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Cash flow */}
      <CashFlowTimeline invoices={invoices} />
    </div>
  );
}
