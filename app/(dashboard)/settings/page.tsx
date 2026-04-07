import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { SettingsClient } from "@/components/settings-client";
import { getStripe } from "@/lib/stripe";

const hasAuth = !!process.env.AUTH_SECRET;
const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;

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

export default async function SettingsPage() {
  const userId = await getUserId();

  if (!userId) {
    return <div className="p-6 text-zinc-500">Please sign in to view settings.</div>;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return <div className="p-6 text-zinc-500">User not found.</div>;

  // Check integrations
  const integrations = await prisma.integration.findMany({
    where: { userId },
  });
  const resendConfigured = !!process.env.RESEND_API_KEY;
  const githubConnected = integrations.some((i) => i.provider === "github" && i.active);

  // Check if user has an active Stripe subscription
  let stripeConnected = false;
  if (stripeConfigured && user?.email) {
    try {
      const stripe = getStripe();
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        const subscriptions = await stripe.subscriptions.list({
          customer: customers.data[0].id,
          status: "active",
          limit: 1,
        });
        stripeConnected = subscriptions.data.length > 0;
      }
    } catch {
      // Stripe not configured or error checking
    }
  }

  return (
    <SettingsClient
      user={{
        id: user.id,
        email: user.email,
        name: user.name,
        timezone: user.timezone,
        currency: user.currency,
        hourlyRate: user.hourlyRate,
      }}
      resendConfigured={resendConfigured}
      githubConnected={githubConnected}
      stripeConnected={stripeConnected}
    />
  );
}