import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewInvoiceForm } from "@/components/forms/new-invoice-form";
import Link from "next/link";
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

const statusColors: Record<string, string> = {
  DRAFT: "bg-zinc-700 text-zinc-300",
  SENT: "bg-blue-900 text-blue-300",
  PAID: "bg-green-900 text-green-300",
  OVERDUE: "bg-red-900 text-red-300",
  CANCELLED: "bg-zinc-800 text-zinc-500",
};

export default async function InvoicesPage() {
  const userId = await getUserId();

  if (!userId) {
    return <div className="p-6 text-zinc-500">Please sign in to view invoices.</div>;
  }

  const [invoices, clients, projects] = await Promise.all([
    prisma.invoice.findMany({
      where: { userId },
      include: { client: true, project: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({
      where: { userId },
      select: { id: true, name: true, clientId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-sm text-zinc-500">{invoices.length} total invoices</p>
        </div>
        <NewInvoiceForm clients={clients} projects={projects} />
      </div>

      <div className="space-y-3">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-zinc-400">#{invoice.number}</span>
                  <span className="font-medium text-white">{invoice.client?.name}</span>
                  <Badge className={statusColors[invoice.status]}>{invoice.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  Due: {new Date(invoice.dueDate).toLocaleDateString()}
                  {invoice.project && ` · ${invoice.project.name}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white">
                  {invoice.currency} {invoice.amount.toLocaleString()}
                </span>
                <Link href={`/invoices/${invoice.id}`}>
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
        {invoices.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            No invoices yet. Create your first invoice to start tracking payments.
          </div>
        )}
      </div>
    </div>
  );
}
