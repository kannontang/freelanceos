import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { Check, CreditCard } from "lucide-react";

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

async function getSubscription(userEmail: string): Promise<{
  id: string;
  status: string;
  plan: "monthly" | "annual";
  currentPeriodEnd: Date;
} | null> {
  try {
    const stripe = getStripe();
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (customers.data.length === 0) return null;

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) return null;

    const sub = subscriptions.data[0];
    const interval = sub.items.data[0].price.recurring?.interval;
    const plan: "monthly" | "annual" = interval === "year" ? "annual" : "monthly";
    return {
      id: sub.id,
      status: sub.status,
      plan,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
    };
  } catch {
    return null;
  }
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const params = await searchParams;
  const success = params.success === "true";
  const canceled = params.canceled === "true";

  const userId = await getUserId();

  let userEmail = "";
  let subscription: {
    id: string;
    status: string;
    plan: "monthly" | "annual";
    currentPeriodEnd: Date;
  } | null = null;

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email) {
      userEmail = user.email;
      subscription = await getSubscription(user.email);
    }
  }

  const plans = [
    {
      name: "Monthly",
      price: "$29",
      period: "/month",
      description: "Billed monthly, cancel anytime",
      features: ["All features", "Unlimited projects", "Email support"],
    },
    {
      name: "Annual",
      price: "$290",
      period: "/year",
      description: "Save 17% vs monthly",
      badge: "Best Value",
      features: ["All features", "Unlimited projects", "Priority support", "Early access"],
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Hero */}
      <div>
        <h1 className="text-2xl font-bold text-white">Manage your subscription</h1>
        <p className="text-sm text-zinc-500">Upgrade to unlock full potential</p>
      </div>

      {/* Demo mode banner */}
      {!hasAuth && (
        <div className="rounded-lg border border-yellow-900 bg-yellow-950/30 p-4">
          <p className="text-sm text-yellow-400">
            ℹ️ Demo mode — AUTH_SECRET not set. Subscription features are for demonstration only.
          </p>
        </div>
      )}

      {/* Success banner */}
      {success && (
        <div className="rounded-lg border border-green-900 bg-green-950/30 p-4">
          <p className="text-sm text-green-400">✅ Subscription activated! Thank you for subscribing.</p>
        </div>
      )}

      {/* Canceled banner */}
      {canceled && (
        <div className="rounded-lg border border-yellow-900 bg-yellow-950/30 p-4">
          <p className="text-sm text-yellow-400">Subscription canceled. You can resubscribe anytime.</p>
        </div>
      )}

      {/* Current plan */}
      {subscription && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="font-medium text-white">Current Plan</h2>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-white">
                {subscription.plan === "monthly" ? "Monthly" : "Annual"}
              </p>
              <p className="text-sm text-zinc-500">
                Status: <span className="text-green-400">{subscription.status}</span> • Renews{" "}
                {subscription.currentPeriodEnd.toLocaleDateString()}
              </p>
            </div>
            <form action="/api/billing/portal" method="POST">
              <button
                type="submit"
                className="rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
              >
                Manage Plan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-lg border ${
              plan.badge ? "border-yellow-600 bg-yellow-950/20" : "border-zinc-800 bg-zinc-900"
            } p-4`}
          >
            {plan.badge && (
              <span className="absolute -top-2 right-2 rounded-full bg-yellow-600 px-2 py-0.5 text-xs font-medium text-black">
                {plan.badge}
              </span>
            )}
            <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
            <p className="mt-1 text-2xl font-bold text-white">
              {plan.price}
              <span className="text-sm font-normal text-zinc-500">{plan.period}</span>
            </p>
            <p className="mt-1 text-sm text-zinc-500">{plan.description}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <form action="/api/billing/checkout" method="POST" className="mt-4">
              <input type="hidden" name="plan" value={plan.name.toLowerCase()} />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
              >
                <CreditCard className="h-4 w-4" />
                {subscription ? "Switch Plan" : "Subscribe"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}