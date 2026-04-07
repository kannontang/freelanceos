import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { SettingsClient } from "@/components/settings-client";

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
    />
  );
}