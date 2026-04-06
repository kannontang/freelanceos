import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) return null;

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-500">Manage your account and integrations</p>
      </div>

      {/* Profile */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-4">
        <h2 className="font-medium text-white">Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-500">Name</label>
            <p className="text-sm text-white">{user?.fullName ?? "—"}</p>
          </div>
          <div>
            <label className="text-xs text-zinc-500">Email</label>
            <p className="text-sm text-white">{user?.emailAddresses[0]?.emailAddress ?? "—"}</p>
          </div>
        </div>
        <Button variant="outline" size="sm">Edit Profile</Button>
      </div>

      {/* Business settings */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-4">
        <h2 className="font-medium text-white">Business</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-500">Default Currency</label>
            <p className="text-sm text-white">USD</p>
          </div>
          <div>
            <label className="text-xs text-zinc-500">Timezone</label>
            <p className="text-sm text-white">Asia/Hong_Kong</p>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-4">
        <h2 className="font-medium text-white">Integrations</h2>
        <div className="space-y-3">
          {[
            { name: "GitHub", desc: "Auto-generate timesheets from commits", connected: false },
            { name: "Stripe", desc: "Payment tracking and invoicing", connected: false },
            { name: "Resend", desc: "Email delivery for agent actions", connected: false },
          ].map((int) => (
            <div key={int.name} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{int.name}</p>
                <p className="text-xs text-zinc-500">{int.desc}</p>
              </div>
              <Button variant="outline" size="sm">
                {int.connected ? "Connected" : "Connect"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Agent settings */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-4">
        <h2 className="font-medium text-white">AI Agents</h2>
        <div className="space-y-3">
          {[
            { name: "Payment Follow-Up Agent", desc: "Auto-send reminders for overdue invoices", enabled: true },
            { name: "Onboarding Agent", desc: "Send client onboarding portals automatically", enabled: true },
            { name: "Compliance Monitor", desc: "Track EU/Asia regulatory changes", enabled: false },
          ].map((agent) => (
            <div key={agent.name} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{agent.name}</p>
                <p className="text-xs text-zinc-500">{agent.desc}</p>
              </div>
              <Button variant={agent.enabled ? "default" : "outline"} size="sm">
                {agent.enabled ? "Enabled" : "Enable"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
