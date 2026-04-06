import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { NewProjectForm } from "@/components/forms/new-project-form";

const hasClerk = process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.includes("placeholder");

async function getAuthUserId(): Promise<string | null> {
  if (!hasClerk) return null;
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}

const statusColors: Record<string, string> = {
  ONBOARDING: "bg-blue-900 text-blue-300",
  ACTIVE: "bg-green-900 text-green-300",
  PAUSED: "bg-amber-900 text-amber-300",
  COMPLETED: "bg-zinc-700 text-zinc-300",
  CANCELLED: "bg-zinc-800 text-zinc-500",
};

export default async function ProjectsPage() {
  const clerkUserId = await getAuthUserId();

  let userId: string | undefined;
  if (clerkUserId) {
    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    userId = user?.id;
  } else {
    const demoUser = await prisma.user.findFirst();
    userId = demoUser?.id;
  }

  if (!userId) return null;

  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      include: { client: true, invoices: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-zinc-500">{projects.length} total projects</p>
        </div>
        <NewProjectForm clients={clients} userId={userId} />
      </div>

      <div className="space-y-3">
        {projects.map((project) => (
          <div key={project.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">{project.name}</h3>
                <p className="text-sm text-zinc-500">{project.client?.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={statusColors[project.status]}>
                  {project.status}
                </Badge>
                <span className="text-sm text-zinc-400">
                  {project.invoices.length} invoices
                </span>
                <Link href={`/projects/${project.id}`} className="text-sm text-blue-400 hover:underline">
                  View
                </Link>
              </div>
            </div>
            {project.githubRepo && (
              <p className="mt-2 text-xs text-zinc-600">{project.githubRepo}</p>
            )}
          </div>
        ))}
        {projects.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            No projects yet. Create your first project to get started.
          </div>
        )}
      </div>
    </div>
  );
}
