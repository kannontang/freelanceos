"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PendingItem {
  id: string;
  invoiceId: string | null;
  details: {
    daysOverdue?: number;
    type?: string;
    amount?: number;
    currency?: string;
  };
  invoice: {
    number: string;
    client: { name: string };
  } | null;
  createdAt: string;
}

interface PendingActionsProps {
  userId: string | undefined;
}

export function PendingActions({ userId }: PendingActionsProps) {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetch(`/api/agent-approvals?status=PENDING&userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.approvals ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  async function handleApprove(invoiceId: string) {
    if (!userId || !invoiceId) return;
    await fetch("/api/agent-approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId, approved: true, userId }),
    });
    router.refresh();
  }

  async function handleDeny(invoiceId: string) {
    if (!userId || !invoiceId) return;
    await fetch("/api/agent-approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId, approved: false, userId }),
    });
    router.refresh();
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-400">Pending Your Action</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-600">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-zinc-400">Pending Your Action</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-600">All caught up! Agents are handling everything else.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded border border-zinc-800 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">via Payment Follow-Up Agent</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-900 text-blue-300">
                    APPROVAL
                  </span>
                </div>
                <p className="text-sm font-medium text-white">
                  {item.invoice
                    ? `${item.invoice.client.name} — Invoice ${item.invoice.number}`
                    : `Invoice ${item.invoiceId?.slice(0, 8)}`}
                </p>
                {item.details && (
                  <p className="text-xs text-zinc-500">
                    {item.details.daysOverdue} days overdue
                    {item.details.amount != null && item.details.currency != null
                      ? ` · ${item.details.currency} ${item.details.amount.toLocaleString()}`
                      : ""}
                    {item.details.type ? ` · ${item.details.type.replace("_", " ")}` : ""}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(item.invoiceId!)}
                    className="bg-green-700 hover:bg-green-600 text-white"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeny(item.invoiceId!)}
                    className="text-zinc-400 hover:text-white"
                  >
                    Deny
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
