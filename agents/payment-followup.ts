import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { draftFollowUpEmail } from "@/lib/claude";
import type { FollowUpType } from "@prisma/client";

export class PaymentFollowUpAgent {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /** Returns all overdue invoices that need attention (fast, no LLM) */
  async checkOverdueInvoices() {
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        userId: this.userId,
        status: { in: ["SENT", "OVERDUE"] },
        dueDate: { lt: new Date() },
      },
      include: {
        client: true,
        paymentFollowUps: { orderBy: { sentAt: "desc" }, take: 1 },
      },
    });

    const results = [];
    for (const invoice of overdueInvoices) {
      const daysOverdue = Math.floor(
        (Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      const lastFollowUp = invoice.paymentFollowUps[0];
      const previousFollowUps = invoice.paymentFollowUps.length;

      // Throttle: skip if sent in last 24h
      if (lastFollowUp) {
        const hoursSinceLast = (Date.now() - new Date(lastFollowUp.sentAt).getTime()) / (1000 * 60 * 60);
        if (hoursSinceLast < 24) continue;
      }

      // Classify urgency
      let type: FollowUpType = "POLITE_REMINDER";
      if (daysOverdue > 14) type = "FINAL_NOTICE";
      else if (daysOverdue > 7) type = "ESCALATION";
      else if (daysOverdue > 3) type = "FIRM_REMINDER";

      // Flag escalation for user approval
      const needsApproval = type === "ESCALATION" || type === "FINAL_NOTICE";

      // Check if already approved (approved activity exists)
      let alreadyApproved = false;
      if (needsApproval) {
        const approval = await prisma.agentActivity.findFirst({
          where: {
            userId: this.userId,
            invoiceId: invoice.id,
            action: { in: ["APPROVED", "REMINDER_SENT"] },
          },
        });
        alreadyApproved = !!approval;
      }

      results.push({
        invoiceId: invoice.id,
        type,
        needsApproval,
        alreadyApproved,
        clientName: invoice.client.name,
        clientEmail: invoice.client.email,
        amount: invoice.amount,
        currency: invoice.currency,
        daysOverdue,
        previousFollowUps,
        lastFollowUpAt: lastFollowUp?.sentAt ?? null,
      });
    }

    return results;
  }

  /** Send a reminder — approved invoices only. Checks DB for approval on ESCALATION/FINAL. */
  async sendReminder(invoiceId: string) {
    // Load invoice + client
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true },
    });
    if (!invoice) throw new Error("Invoice not found");

    const daysOverdue = Math.floor(
      (Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const previousFollowUps = invoice.paymentFollowUps?.length ?? 0;

    // Classify type
    let type: FollowUpType = "POLITE_REMINDER";
    if (daysOverdue > 14) type = "FINAL_NOTICE";
    else if (daysOverdue > 7) type = "ESCALATION";
    else if (daysOverdue > 3) type = "FIRM_REMINDER";

    // Approval gate for escalation / final notice
    const needsApproval = type === "ESCALATION" || type === "FINAL_NOTICE";
    if (needsApproval) {
      const approval = await prisma.agentActivity.findFirst({
        where: {
          userId: this.userId,
          invoiceId,
          action: { in: ["APPROVED", "REMINDER_SENT"] },
        },
      });
      if (!approval) {
        // Log as pending approval if not already logged
        const existingPending = await prisma.agentActivity.findFirst({
          where: { userId: this.userId, invoiceId, action: "PENDING_APPROVAL" },
        });
        if (!existingPending) {
          await prisma.agentActivity.create({
            data: {
              userId: this.userId,
              agentType: "PAYMENT_FOLLOWUP",
              action: "PENDING_APPROVAL",
              invoiceId,
              details: { daysOverdue, type, amount: invoice.amount, currency: invoice.currency },
            },
          });
        }
        return {
          success: false,
          reason: "PENDING_APPROVAL",
          message: `Invoice requires user approval before sending. POST /api/agent-approvals with { invoiceId, approved: true, userId } to approve.`,
        };
      }
    }

    // Draft email via OpenRouter + LangChain
    const email = await draftFollowUpEmail({
      clientName: invoice.client.name,
      invoiceNumber: invoice.number,
      amount: invoice.amount,
      currency: invoice.currency,
      daysOverdue,
      previousFollowUps,
    });

    // Send via Resend
    const { data, error } = await resend.emails.send({
      from: "FreelanceOS <noreply@freelanceos.ai>",
      to: invoice.client.email,
      subject: email.subject,
      text: email.body,
    });

    if (error) {
      await prisma.agentActivity.create({
        data: {
          userId: this.userId,
          agentType: "PAYMENT_FOLLOWUP",
          action: "FAILED",
          invoiceId,
          status: "error",
          details: { error: String(error) },
        },
      });
      throw error;
    }

    // Mark approved (prevent re-sends)
    await prisma.agentActivity.upsert({
      where: { id: `${invoiceId}-approved` },
      create: {
        id: `${invoiceId}-approved`,
        userId: this.userId,
        agentType: "PAYMENT_FOLLOWUP",
        action: "REMINDER_SENT",
        invoiceId,
        details: { emailId: data?.id },
      },
      update: {},
    });

    // Update invoice status
    if (invoice.status !== "OVERDUE") {
      await prisma.invoice.update({ where: { id: invoiceId }, data: { status: "OVERDUE" } });
    }

    // Record follow-up
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
        action: `REMINDER_SENT`,
        status: "success",
        invoiceId,
        details: { type, clientEmail: invoice.client.email, emailId: data?.id },
      },
    });

    return { success: true, emailId: data?.id, email };
  }
}
