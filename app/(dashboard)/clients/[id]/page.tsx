import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const projectStatusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  ONBOARDING: "default",
  ACTIVE: "success",
  PAUSED: "warning",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

const invoiceStatusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  DRAFT: "secondary",
  SENT: "default",
  PAID: "success",
  OVERDUE: "destructive",
  CANCELLED: "secondary",
};

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      projects: { orderBy: { createdAt: "desc" } },
      invoices: { include: { project: true }, orderBy: { createdAt: "desc" } },
      onboardingForms: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) notFound();

  const totalRevenue = client.invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.amount, 0);

  const totalOutstanding = client.invoices
    .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div>
        <Link href="/clients" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← Back to Clients
        </Link>
        <h1 className="text-2xl font-bold text-white mt-1">{client.name}</h1>
        {client.company && (
          <p className="text-sm text-zinc-500">{client.company}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{formatCurrency(totalOutstanding)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.projects.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-zinc-500">Email:</span>{" "}
              <span className="text-white">{client.email}</span>
            </div>
            {client.phone && (
              <div>
                <span className="text-zinc-500">Phone:</span>{" "}
                <span className="text-white">{client.phone}</span>
              </div>
            )}
            {client.country && (
              <div>
                <span className="text-zinc-500">Country:</span>{" "}
                <span className="text-white">{client.country}</span>
              </div>
            )}
            {client.vatNumber && (
              <div>
                <span className="text-zinc-500">VAT Number:</span>{" "}
                <span className="text-white">{client.vatNumber}</span>
              </div>
            )}
            {client.notes && (
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-zinc-500">Notes:</span>
                <p className="text-zinc-300 mt-1">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">Edit Client</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={`/api/clients/${client.id}`} method="POST" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={client.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={client.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" defaultValue={client.company ?? ""} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" defaultValue={client.phone ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" defaultValue={client.country ?? ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vatNumber">VAT Number</Label>
                <Input id="vatNumber" name="vatNumber" defaultValue={client.vatNumber ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" defaultValue={client.notes ?? ""} />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-zinc-400">Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {client.projects.length === 0 ? (
            <p className="text-sm text-zinc-600">No projects yet.</p>
          ) : (
            <div className="space-y-2">
              {client.projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between rounded border border-zinc-800 p-3">
                  <div>
                    <p className="text-sm font-medium text-white">{project.name}</p>
                    {project.description && (
                      <p className="text-xs text-zinc-500 mt-0.5">{project.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {project.budget && (
                      <span className="text-xs text-zinc-500">{formatCurrency(project.budget)}</span>
                    )}
                    <Badge variant={projectStatusVariant[project.status] ?? "default"}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-zinc-400">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {client.invoices.length === 0 ? (
            <p className="text-sm text-zinc-600">No invoices yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-2 text-left font-medium">Number</th>
                  <th className="pb-2 text-left font-medium">Project</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                  <th className="pb-2 text-right font-medium">Due</th>
                  <th className="pb-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {client.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-zinc-800/50">
                    <td className="py-2">
                      <Link href={`/invoices/${inv.id}`} className="text-blue-400 hover:underline">
                        {inv.number}
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
    </div>
  );
}
