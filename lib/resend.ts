import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "FreelanceOS <noreply@freelanceos.dev>";

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    react,
  });

  if (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }

  return data;
}

export async function sendPaymentReminder({
  to,
  clientName,
  invoiceNumber,
  amount,
  currency,
  daysOverdue,
  paymentLink,
}: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  daysOverdue: number;
  paymentLink: string;
}) {
  const subject =
    daysOverdue <= 3
      ? `Friendly reminder: Invoice ${invoiceNumber} is due`
      : daysOverdue <= 7
        ? `Payment overdue: Invoice ${invoiceNumber}`
        : `Urgent: Invoice ${invoiceNumber} is ${daysOverdue} days overdue`;

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e1b4b;">Payment Reminder</h2>
        <p>Hi ${clientName},</p>
        <p>This is a reminder that invoice <strong>${invoiceNumber}</strong> for
        <strong>${new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)}</strong>
        is ${daysOverdue > 0 ? `${daysOverdue} days overdue` : "due soon"}.</p>
        <p>
          <a href="${paymentLink}" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px;">
            Pay Now
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          If you've already made this payment, please disregard this message.
        </p>
        <p>Thank you,<br/>FreelanceOS</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Payment reminder failed: ${error.message}`);
  }
  return data;
}
