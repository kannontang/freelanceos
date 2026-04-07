import React from "react";
import { prisma } from "@/lib/prisma";

// Initialize Resend - will only work if API key is set
let resend: any = null;
if (process.env.RESEND_API_KEY) {
  // Lazy import to avoid errors when not configured
  import("resend").then((mod) => {
    resend = mod.default || mod;
  });
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  dueDate: Date;
  status: string;
  lineItems?: any;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string | null;
}

interface User {
  id: string;
  email: string;
  name?: string | null;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function sendInvoiceEmail(
  invoice: Invoice,
  client: Client,
  user: User
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    return { success: false, error: "Resend not configured" };
  }

  const lineItems = (invoice.lineItems as Array<{
    description: string;
    amount: number;
  }>) || [];

  try {
    const { data, error } = await resend.emails.send({
      from: "FreelanceOS <noreply@yourdomain.com>",
      to: [client.email],
      subject: `Invoice ${invoice.number} - ${formatCurrency(invoice.amount, invoice.currency)}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { margin-bottom: 20px; }
    .invoice-number { font-size: 24px; font-weight: bold; }
    .details { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .details-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .amount { font-size: 28px; font-weight: bold; color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f9f9f9; }
    .total { font-size: 20px; font-weight: bold; }
    .footer { margin-top: 30px; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="invoice-number">Invoice ${invoice.number}</div>
      <p>From: ${user.name || user.email}</p>
    </div>
    
    <div class="details">
      <div class="details-row">
        <span>Client:</span>
        <span>${client.name}${client.company ? ` (${client.company})` : ""}</span>
      </div>
      <div class="details-row">
        <span>Due Date:</span>
        <span>${formatDate(invoice.dueDate)}</span>
      </div>
      <div class="details-row">
        <span>Status:</span>
        <span>${invoice.status}</span>
      </div>
    </div>

    ${lineItems.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineItems
          .map(
            (item) => `
          <tr>
            <td>${item.description}</td>
            <td style="text-align: right;">${formatCurrency(item.amount, invoice.currency)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
      <tfoot>
        <tr>
          <td><strong>Total</strong></td>
          <td style="text-align: right;"><strong class="total">${formatCurrency(invoice.amount, invoice.currency)}</strong></td>
        </tr>
      </tfoot>
    </table>
    ` : `
    <div class="amount">${formatCurrency(invoice.amount, invoice.currency)}</div>
    `}

    <div class="footer">
      <p>Payment is due by ${formatDate(invoice.dueDate)}.</p>
      <p>Please contact ${user.email} if you have any questions.</p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Email error:", err);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendWelcomeEmail(user: User): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    return { success: false, error: "Resend not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "FreelanceOS <noreply@yourdomain.com>",
      to: [user.email],
      subject: "Welcome to FreelanceOS!",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; }
    .features { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .features li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to FreelanceOS!</h1>
    <p>Hi ${user.name || "there"},</p>
    <p>Thank you for signing up for FreelanceOS. You're now ready to manage your freelance business more efficiently.</p>
    
    <div class="features">
      <strong>What you can do:</strong>
      <ul>
        <li>Create and send professional invoices</li>
        <li>Track payments and follow up on overdue invoices</li>
        <li>Manage your clients and projects</li>
        <li>Monitor your revenue and business metrics</li>
      </ul>
    </div>
    
    <p>Get started by creating your first client and invoice!</p>
    
    <p>Best,<br>The FreelanceOS Team</p>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Email error:", err);
    return { success: false, error: "Failed to send email" };
  }
}