import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Activity {
  id: string;
  agentType: string;
  action: string;
  status: string;
  details: Record<string, unknown> | null;
  createdAt: Date;
}

const agentIcons: Record<string, string> = {
  PAYMENT_FOLLOWUP: "📧",
  ONBOARDING: "🚀",
  COMPLIANCE: "⚖️",
  GITHUB_INVOICE: "📊",
};

const statusColors: Record<string, string> = {
  success: "text-green-400",
  pending: "text-yellow-400",
  failed: "text-red-400",
};

export function AgentActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-zinc-400">Agent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-zinc-600">No agent activity yet. Agents run automatically in the background.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <span className="text-base">{agentIcons[activity.agentType] ?? "🤖"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="text-xs text-zinc-500">
                    {activity.agentType.replace("_", " ")} ·{" "}
                    <span className={statusColors[activity.status] ?? ""}>{activity.status}</span>
                  </p>
                </div>
                <span className="text-xs text-zinc-600 whitespace-nowrap">
                  {new Date(activity.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
