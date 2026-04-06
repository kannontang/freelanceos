"use client";

import { Button } from "@/components/ui/button";

export function SendReminderButton({ invoiceNumber }: { invoiceNumber: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => alert(`Reminder for ${invoiceNumber} will be sent via agent — coming soon!`)}
    >
      Send Reminder
    </Button>
  );
}
