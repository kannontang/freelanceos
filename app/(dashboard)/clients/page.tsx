import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ClientsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const clients = await prisma.client.findMany({
    where: { userId },
    include: { _count: { select: { projects: true, invoices: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-sm text-zinc-500">{clients.length} clients</p>
        </div>
        <Button>+ Add Client</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {clients.map((client) => (
          <Link key={client.id} href={`/clients/${client.id}`} className="block rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">{client.name}</h3>
                <p className="text-sm text-zinc-500">{client.email}</p>
              </div>
              {client.country && (
                <span className="text-xs text-zinc-600">{client.country}</span>
              )}
            </div>
            <div className="mt-3 flex gap-4 text-xs text-zinc-500">
              <span>{client._count.projects} projects</span>
              <span>{client._count.invoices} invoices</span>
            </div>
          </Link>
        ))}
        {clients.length === 0 && (
          <div className="col-span-3 text-center py-12 text-zinc-500">
            No clients yet. Add your first client to start managing your freelance business.
          </div>
        )}
      </div>
    </div>
  );
}
