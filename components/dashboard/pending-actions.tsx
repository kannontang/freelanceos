import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const pendingItems = [
  {
    id: "1",
    type: "APPROVAL",
    title: "Approve follow-up email to Acme Corp",
    description: "Invoice #1042 is 7 days overdue. Agent drafted this reminder.",
    agent: "Payment Follow-Up Agent",
  },
  {
    id: "2",
    type: "COMPLIANCE",
    title: "French VAT format updated",
    description: "Action required: Update your invoice template for French clients by Sep 2026.",
    agent: "Compliance Monitor",
  },
  {
    id: "3",
    type: "ONBOARDING",
    title: "New client onboarding ready",
    description: "TechCorp Inc has completed the onboarding form. Review and start the project.",
    agent: "Onboarding Agent",
  },
];

export function PendingActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-zinc-400">Pending Your Action</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingItems.length === 0 ? (
          <p className="text-sm text-zinc-600">All caught up! Agents are handling everything else.</p>
        ) : (
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <div key={item.id} className="rounded border border-zinc-800 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">via {item.agent}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    item.type === "APPROVAL" ? "bg-blue-900 text-blue-300" :
                    item.type === "COMPLIANCE" ? "bg-orange-900 text-orange-300" :
                    "bg-purple-900 text-purple-300"
                  }`}>
                    {item.type}
                  </span>
                </div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-zinc-500">{item.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="default">Approve</Button>
                  <Button size="sm" variant="ghost">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
