interface PaymentReminderProps {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  dueDate: string;
  daysOverdue: number;
  paymentUrl: string;
  freelancerName: string;
}

export function paymentReminderEmail({
  clientName,
  invoiceNumber,
  amount,
  currency,
  dueDate,
  daysOverdue,
  paymentUrl,
  freelancerName,
}: PaymentReminderProps) {
  const isOverdue = daysOverdue > 0;
  const subject = isOverdue
    ? `Payment overdue: Invoice ${invoiceNumber} (${daysOverdue} days)`
    : `Payment reminder: Invoice ${invoiceNumber} due ${dueDate}`;

  const greeting = isOverdue
    ? `I hope this message finds you well. I'm writing to follow up on invoice <strong>${invoiceNumber}</strong> for <strong>${currency} ${amount}</strong>, which was due on ${dueDate}.`
    : `Just a friendly heads-up that invoice <strong>${invoiceNumber}</strong> for <strong>${currency} ${amount}</strong> is coming due on <strong>${dueDate}</strong>.`;

  const tone = daysOverdue > 14
    ? `<p>This invoice is now <strong>${daysOverdue} days past due</strong>. I'd appreciate it if we could resolve this promptly. If there are any issues with the invoice or payment process, please let me know so we can work it out.</p>`
    : daysOverdue > 7
    ? `<p>This payment is now ${daysOverdue} days overdue. Could you please arrange payment at your earliest convenience? If there's anything holding this up, I'm happy to discuss.</p>`
    : isOverdue
    ? `<p>If this has already been taken care of, please disregard this message. Otherwise, could you let me know when I can expect payment?</p>`
    : `<p>No rush — just wanted to make sure this is on your radar.</p>`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .wrapper { background: #f5f5f5; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; }
    .header { background: #18181b; padding: 24px 32px; }
    .header h1 { color: #ffffff; font-size: 18px; margin: 0; }
    .body { padding: 32px; }
    .invoice-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 24px 0; }
    .invoice-box table { width: 100%; border-collapse: collapse; }
    .invoice-box td { padding: 6px 0; font-size: 14px; }
    .invoice-box td:first-child { color: #6b7280; }
    .invoice-box td:last-child { text-align: right; font-weight: 600; color: #18181b; }
    .amount-row td { font-size: 18px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
    .cta { text-align: center; margin: 32px 0; }
    .cta a { display: inline-block; background: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; }
    .footer { padding: 24px 32px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>${isOverdue ? "⏰" : "📋"} Invoice ${isOverdue ? "Overdue" : "Reminder"}</h1>
      </div>
      <div class="body">
        <p>Hi ${clientName},</p>
        <p>${greeting}</p>

        <div class="invoice-box">
          <table>
            <tr>
              <td>Invoice</td>
              <td>${invoiceNumber}</td>
            </tr>
            <tr>
              <td>Due Date</td>
              <td>${dueDate}</td>
            </tr>
            ${isOverdue ? `<tr><td>Status</td><td style="color: #dc2626;">${daysOverdue} days overdue</td></tr>` : ""}
            <tr class="amount-row">
              <td>Amount Due</td>
              <td>${currency} ${amount}</td>
            </tr>
          </table>
        </div>

        ${tone}

        <div class="cta">
          <a href="${paymentUrl}">Pay Now →</a>
        </div>

        <p>Thank you for your business!</p>
        <p>Best regards,<br>${freelancerName}</p>
      </div>
      <div class="footer">
        <p>Sent by FreelanceOS on behalf of ${freelancerName}</p>
        <p>If you've already made this payment, please disregard this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, html };
}
