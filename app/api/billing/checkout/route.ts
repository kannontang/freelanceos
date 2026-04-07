import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";
import { z } from "zod";

const hasAuth = !!process.env.AUTH_SECRET;

async function getUserId(): Promise<string | null> {
  if (!hasAuth) {
    const demoUser = await prisma.user.findFirst();
    return demoUser?.id ?? null;
  }
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user?.id ?? null;
}

const checkoutSchema = z.object({
  plan: z.enum(["monthly", "annual"]).default("monthly"),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const body = await request.json();
    const { plan } = checkoutSchema.parse(body);

    const stripe = getStripe();

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customer: Stripe.Customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId },
      });
    }

    // Price IDs for subscription plans (create these in your Stripe Dashboard)
    const PRICES = {
      monthly: process.env.STRIPE_PRICE_MONTHLY,
      annual: process.env.STRIPE_PRICE_ANNUAL,
    };

    // Fallback: create price on the fly if not configured
    const priceId = PRICES[plan];
    let actualPriceId = priceId;

    if (!priceId) {
      // Create price dynamically (for development)
      const price = await stripe.prices.create({
        unit_amount: plan === "monthly" ? 2900 : 29000,
        currency: "usd",
        recurring: {
          interval: plan === "monthly" ? "month" : "year",
        },
        product_data: {
          name: plan === "monthly" ? "FreelanceOS Monthly" : "FreelanceOS Annual",
        },
      });
      actualPriceId = price.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: actualPriceId,
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/billing?success=true`,
      cancel_url: `${request.nextUrl.origin}/billing?canceled=true`,
      metadata: { userId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}