import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { resend } from "@/lib/resend";
import { draftFollowUpEmail } from "@/lib/claude";
import type { FollowUpType } from "@prisma/client";

export class PaymentFollowUpAgent {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async checkOverdueInvoices() {
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        userId: this.userId,
        status: { in: ["SENT", "OVERDUE"] },
        dueDate: { lt: new Date() },
      },
      include: {
        client: true,
        paymentFollowUps: { orderBy: { sentAt: "desc" } },
      },
    });

    const results = [];
    for (const invoice of overdueInvoices) {
      const daysOverdue = Math.floor(
        (Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      const previousFollowUps = invoice.paymentFollowUps.length;

      // Determine follow-up type based on days overdue
      let type: FollowUpType = "POLITE_REMINDER";
      if (daysOverdue > 14) type = "FINAL_NOTICE";
      else if (daysOverdue > 7) type = "ESCALATION";
      else if (daysOverdue > 3) type = "FIRM_REMINDER";

      // Check if we should send a reminder (once per day max)
      const lastFollowUp = invoice.paymentFollowUps[0];
      if (lastFollowUp) {
        const hoursSinceLast = (Date.now() - new Date(lastFollowUp.sentAt).getTime()) / (1000 * 60 * 60);
        if (hoursSinceLast < 24) continue; // Skip if sent reminder in last 24h
      }

      // Draft email via Claude
      const email = await draftFollowUpEmail({
        clientName: invoice.client.name,
        invoiceNumber: invoice.number,
        amount: invoice.amount,
        currency: invoice.currency,
        daysOverdue,
        previousFollowUps,
      });

      results.push({
        invoiceId: invoice.id,
        type,
        email,
        daysOverdue,
      });
    }

    return results;
  }

  async sendReminder(
    invoiceId: string,
    type: FollowUpType,
    email: { subject: string; body: string },
    approvedByUser: boolean
  ) {
    if (!approvedByUser) {
      throw new Error("User must approve before sending financial emails");
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true, user: true },
    });

    if (!invoice) throw new Error("Invoice not found");

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: "FreelanceOS <noreply@freelanceos.ai>",
      to: invoice.client.email,
      subject: email.subject,
      text: email.body,
    });

    if (error) throw error;

    // Update invoice status if overdue
    const isOverdue = invoice.status === "SENT";
    if (isOverdue) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "OVERDUE" },
      });
    }

    // Record the follow-up
    await prisma.paymentFollowUp.create({
      data: {
        invoiceId,
        type,
        channel: "email",
        message: email.body,
        response: data?.id ?? null,
      },
    });

    // Log agent activity
    await prisma.agentActivity.create({
      data: {
        userId: this.userId,
        agentType: "PAYMENT_FOLLOWUP",
        action: `Sent ${type.replace("_", " ").toLowerCase()} to ${invoice.client.name}`,
        status: "success",
        details: { invoiceId, type, emailId: data?.id },
      },
    });

    return { success: true, emailId: data?.id };
  }
}
