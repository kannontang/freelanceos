import Stripe from "stripe";

// Initialize Stripe - will only work if API key is set
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
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

export async function createCheckoutSession(
  invoice: Invoice,
  client: Client,
  user: User
): Promise<{ url?: string; error?: string }> {
  if (!stripe) {
    return { error: "Stripe not configured" };
  }

  const lineItems = (invoice.lineItems as Array<{
    description: string;
    amount: number;
  }>) || [];

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: {
              name: `Invoice ${invoice.number}`,
              description: client.company
                ? `${client.name} - ${client.company}`
                : client.name,
            },
            unit_amount: Math.round(invoice.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invoices/${invoice.id}?paid=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invoices/${invoice.id}`,
      customer_email: client.email || undefined,
      metadata: {
        invoiceId: invoice.id,
        userId: user.id,
      },
    });

    return { url: session.url ?? undefined };
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return { error: "Failed to create checkout session" };
  }
}

export async function createPortalSession(
  user: User
): Promise<{ url?: string; error?: string }> {
  if (!stripe) {
    return { error: "Stripe not configured" };
  }

  try {
    // In a real app, you'd store the Stripe customer ID in the Integration table
    // For now, we'll require a customer to exist first
    return { error: "No Stripe customer found. Please connect Stripe first." };
  } catch (err) {
    console.error("Stripe portal error:", err);
    return { error: "Failed to create portal session" };
  }
}

export function getStripe() {
  return stripe;
}