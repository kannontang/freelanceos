"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  email: string;
  name: string | null;
  timezone: string;
  currency: string;
  hourlyRate: number | null;
}

interface SettingsPageProps {
  user: User;
  resendConfigured: boolean;
  githubConnected: boolean;
  stripeConnected: boolean;
}

export function SettingsClient({
  user: initialUser,
  resendConfigured,
  githubConnected,
  stripeConnected,
}: SettingsPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialUser.name ?? "");
  const [timezone, setTimezone] = useState(initialUser.timezone);
  const [currency, setCurrency] = useState(initialUser.currency);
  const [hourlyRate, setHourlyRate] = useState(initialUser.hourlyRate?.toString() ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, timezone, currency, hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null }),
      });

      if (!res.ok) throw new Error("Failed to save");

      router.refresh();
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-500">Manage your account and integrations</p>
      </div>

      {/* Profile */}
      <form onSubmit={handleSubmit} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-4">
        <h2 className="font-medium text-white">Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs text-zinc-500">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-zinc-500">Email</Label>
            <p className="text-sm text-white">{initialUser.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-xs text-zinc-500">Timezone</Label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
            >
              <option value="UTC">UTC</option>
              <option value="Asia/Hong_Kong">Asia/Hong_Kong</option>
              <option value="America/New_York">America/New York</option>
              <option value="America/Los_Angeles">America/Los Angeles</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Paris">Europe/Paris</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-xs text-zinc-500">Currency</Label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="HKD">HKD</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hourlyRate" className="text-xs text-zinc-500">Hourly Rate</Label>
          <Input
            id="hourlyRate"
            type="number"
            step="0.01"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </form>

      {/* Integrations */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-4">
        <h2 className="font-medium text-white">Integrations</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Resend</p>
              <p className="text-xs text-zinc-500">Email delivery for agent actions</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${resendConfigured ? "bg-green-900 text-green-300" : "bg-zinc-800 text-zinc-500"}`}>
              {resendConfigured ? "Configured" : "Not configured"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">GitHub</p>
              <p className="text-xs text-zinc-500">Auto-generate timesheets from commits</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${githubConnected ? "bg-green-900 text-green-300" : "bg-zinc-800 text-zinc-500"}`}>
              {githubConnected ? "Connected" : "Not connected"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">FreelanceOS Billing</p>
              <p className="text-xs text-zinc-500">Subscription for SaaS features</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${stripeConnected ? "bg-green-900 text-green-300" : "bg-zinc-800 text-zinc-500"}`}>
              {stripeConnected ? "Active" : "Not active"}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-red-900 bg-red-950/20 p-4 space-y-4">
        <h2 className="font-medium text-red-400">Danger Zone</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Export Data</p>
              <p className="text-xs text-zinc-500">Download all your data as JSON</p>
            </div>
            <a href="/api/settings/export">
              <Button variant="outline" size="sm">Export</Button>
            </a>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Delete Account</p>
              <p className="text-xs text-zinc-500">Permanently delete your account and all data</p>
            </div>
            <Button variant="outline" size="sm" disabled>Delete</Button>
          </div>
        </div>
      </div>
    </div>
  );
}