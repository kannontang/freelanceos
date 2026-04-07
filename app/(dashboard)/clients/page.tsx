import { prisma } from "@/lib/prisma";
import { NewClientForm } from "@/components/forms/new-client-form";
import Link from "next/link";
import { auth } from "@/auth";

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

export default async function ClientsPage() {
  const userId = await getUserId();

  if (!userId) {
    return <div className="p-6 text-zinc-500">Please sign in to view clients.</div>;
  }

  const clients = await prisma.client.findMany({
    where: { userId },
    include: { projects: true, invoices: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-sm text-zinc-500">{clients.length} clients</p>
        </div>
        <NewClientForm />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="block rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">{client.name}</h3>
                <p className="text-sm text-zinc-500">{client.email || "—"}</p>
                {client.company && (
                  <p className="text-xs text-zinc-600">{client.company}</p>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-4 text-xs text-zinc-500">
              <span>{client.projects.length} projects</span>
              <span>{client.invoices.length} invoices</span>
            </div>
          </Link>
        ))}
        {clients.length === 0 && (
          <div className="col-span-3 text-center py-12 text-zinc-500">
            No clients yet. Add your first client to start managing your freelance
            business.
          </div>
        )}
      </div>
    </div>
  );
}