import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: Date;
  paidAt: Date | null;
  client?: { name: string };
}

export function CashFlowTimeline({ invoices }: { invoices: Invoice[] }) {
  const upcoming = invoices
    .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-zinc-400">Cash Flow Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <p className="text-sm text-zinc-600">No upcoming payments.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((invoice) => {
              const isOverdue = invoice.status === "OVERDUE";
              return (
                <div key={invoice.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{invoice.client?.name}</p>
                    <p className="text-xs text-zinc-500">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${isOverdue ? "text-red-400" : "text-white"}`}>
                      {invoice.currency} {invoice.amount.toLocaleString()}
                    </p>
                    {isOverdue && <p className="text-xs text-red-500">Overdue</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
