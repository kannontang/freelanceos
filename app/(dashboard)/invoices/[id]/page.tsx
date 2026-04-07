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
import { SendReminderButton } from "@/components/send-reminder-button";

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  DRAFT: "secondary",
  SENT: "default",
  PAID: "success",
  OVERDUE: "destructive",
  CANCELLED: "secondary",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { client: true, project: true },
  });

  if (!invoice) notFound();

  const lineItems = (invoice.lineItems as Array<{ description: string; hours?: number; rate?: number; amount: number }>) ?? [];

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/invoices" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Back to Invoices
          </Link>
          <h1 className="text-2xl font-bold text-white mt-1">
            Invoice {invoice.number}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant[invoice.status] ?? "default"}>
            {invoice.status}
          </Badge>
          {(invoice.status === "SENT" || invoice.status === "OVERDUE") && (
            <SendReminderButton invoiceNumber={invoice.number} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <p className="text-sm text-white">
                {invoice.client.name}
                {invoice.client.company && (
                  <span className="text-zinc-500"> — {invoice.client.company}</span>
                )}
              </p>
            </div>
            {invoice.project && (
              <div className="space-y-2">
                <Label>Project</Label>
                <p className="text-sm text-white">{invoice.project.name}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <p className="text-sm text-white">{formatDate(invoice.dueDate)}</p>
              </div>
            </div>
            {invoice.vatRate && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>VAT Rate</Label>
                  <p className="text-sm text-white">{invoice.vatRate}%</p>
                </div>
                <div className="space-y-2">
                  <Label>VAT Amount</Label>
                  <p className="text-sm text-white">
                    {formatCurrency(invoice.vatAmount ?? 0, invoice.currency)}
                  </p>
                </div>
              </div>
            )}
            {invoice.paidAt && (
              <div className="space-y-2">
                <Label>Paid On</Label>
                <p className="text-sm text-green-400">{formatDate(invoice.paidAt)}</p>
              </div>
            )}
            {invoice.notes && (
              <div className="space-y-2">
                <Label>Notes</Label>
                <p className="text-sm text-zinc-400">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">Edit Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={`/api/invoices/${invoice.id}`} method="POST" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={invoice.status}
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
                >
                  {["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" step="0.01" defaultValue={invoice.amount} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" name="dueDate" type="date" defaultValue={invoice.dueDate.toISOString().split("T")[0]} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" defaultValue={invoice.notes ?? ""} />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      {lineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-2 text-left font-medium">Description</th>
                  <th className="pb-2 text-right font-medium">Hours</th>
                  <th className="pb-2 text-right font-medium">Rate</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    <td className="py-2 text-white">{item.description}</td>
                    <td className="py-2 text-right text-zinc-400">{item.hours ?? "—"}</td>
                    <td className="py-2 text-right text-zinc-400">
                      {item.rate ? formatCurrency(item.rate, invoice.currency) : "—"}
                    </td>
                    <td className="py-2 text-right text-white">
                      {formatCurrency(item.amount, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-2 text-right font-medium text-zinc-400">Total</td>
                  <td className="pt-2 text-right font-bold text-white">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
