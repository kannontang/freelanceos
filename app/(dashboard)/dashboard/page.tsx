import { prisma } from "@/lib/prisma";
import { AgentActivityFeed } from "@/components/dashboard/agent-activity-feed";
import { PendingActions } from "@/components/dashboard/pending-actions";
import { CashFlowTimeline } from "@/components/dashboard/cash-flow-timeline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { auth } from "@/auth";

const hasAuth = !!process.env.AUTH_SECRET;

async function getUserId(): Promise<string | undefined> {
  if (!hasAuth) {
    const demoUser = await prisma.user.findFirst();
    return demoUser?.id;
  }
  const session = await auth();
  if (!session?.user?.email) return undefined;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user?.id;
}

// SVG Revenue Chart Component
function RevenueChart({ invoices }: { invoices: any[] }) {
  const currentYear = new Date().getFullYear();
  
  // Group paid invoices by month
  const monthlyRevenue: Record<number, number> = {};
  for (let i = 1; i <= 12; i++) monthlyRevenue[i] = 0;
  
  invoices
    .filter((i) => i.status === "PAID" && new Date(i.paidAt || i.createdAt).getFullYear() === currentYear)
    .forEach((i) => {
      const month = new Date(i.paidAt || i.createdAt).getMonth() + 1;
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + i.amount;
    });

  const maxRevenue = Math.max(...Object.values(monthlyRevenue), 100);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const barWidth = 24;
  const gap = 8;
  const chartWidth = 12 * (barWidth + gap);
  const chartHeight = 120;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-zinc-400">Monthly Revenue ({currentYear})</h4>
      <svg width={chartWidth} height={chartHeight + 20} className="overflow-visible">
        {months.map((month, i) => {
          const barHeight = (monthlyRevenue[i + 1] / maxRevenue) * chartHeight;
          return (
            <g key={month}>
              <rect
                x={i * (barWidth + gap)}
                y={chartHeight - barHeight}
                width={barWidth}
                height={barHeight}
                fill="#3b82f6"
                className="transition-all"
              />
              <text
                x={i * (barWidth + gap) + barWidth / 2}
                y={chartHeight + 14}
                textAnchor="middle"
                className="fill-zinc-500 text-xs"
              >
                {month.slice(0, 1)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// SVG Status Breakdown Donut Chart
function StatusBreakdown({ invoices }: { invoices: any[] }) {
  const statusCounts = {
    DRAFT: 0,
    SENT: 0,
    PAID: 0,
    OVERDUE: 0,
    CANCELLED: 0,
  };
  
  invoices.forEach((i) => {
    if (i.status in statusCounts) {
      statusCounts[i.status as keyof typeof statusCounts]++;
    }
  });

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  if (total === 0) return <p className="text-sm text-zinc-500">No invoices</p>;

  const colors: Record<string, string> = {
    DRAFT: "#71717a",
    SENT: "#3b82f6",
    PAID: "#22c55e",
    OVERDUE: "#ef4444",
    CANCELLED: "#52525b",
  };

  const size = 100;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let offset = 0;
  const segments = Object.entries(statusCounts).map(([status, count]) => {
    const percent = count / total;
    const dashArray = percent * circumference;
    const segment = {
      status,
      count,
      percent,
      dashArray,
      offset,
      color: colors[status],
    };
    offset += dashArray;
    return segment;
  });

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-zinc-400">Invoice Status</h4>
      <div className="flex items-center gap-4">
        <svg width={size} height={size} className="rotate-[-90deg]">
          {segments.map((seg) => (
            <circle
              key={seg.status}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dashArray} ${circumference}`}
              strokeDashoffset={-seg.offset}
            />
          ))}
        </svg>
        <div className="space-y-1 text-xs">
          {segments.map((seg) => (
            <div key={seg.status} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: seg.color }} />
              <span className="text-zinc-400">{seg.status}</span>
              <span className="text-white">{seg.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Recent Activity Component
function RecentActivity({ invoices }: { invoices: any[] }) {
  // Get status changes from invoice history (simulated by looking at updatedAt vs createdAt)
  const recentChanges = invoices
    .filter((i) => i.status !== "DRAFT")
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      number: i.number,
      status: i.status,
      updatedAt: i.updatedAt,
    }));

  if (recentChanges.length === 0) {
    return <p className="text-sm text-zinc-500">No recent activity</p>;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-zinc-400">Recent Activity</h4>
      <div className="space-y-2">
        {recentChanges.map((change) => (
          <div key={change.id} className="flex items-center justify-between text-sm">
            <span className="text-white">{change.number}</span>
            <div className="flex items-center gap-2">
              <Badge variant={change.status === "PAID" ? "success" : change.status === "OVERDUE" ? "destructive" : "default"}>
                {change.status}
              </Badge>
              <span className="text-xs text-zinc-500">{formatDate(change.updatedAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const userId = await getUserId();

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
      {!hasAuth && (
        <div className="rounded-lg border border-yellow-800 bg-yellow-950/50 p-4">
          <p className="text-sm text-yellow-300">
            <strong>Demo Mode</strong> — Add <code className="bg-yellow-900/50 px-1 rounded">AUTH_SECRET</code> to your <code className="bg-yellow-900/50 px-1 rounded">.env</code> to enable real auth.
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

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Revenue Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart invoices={invoices} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBreakdown invoices={invoices} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity invoices={invoices} />
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
        <AgentActivityFeed
          activities={recentActivity as React.ComponentProps<typeof AgentActivityFeed>["activities"]}
        />
        <PendingActions userId={userId} />
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