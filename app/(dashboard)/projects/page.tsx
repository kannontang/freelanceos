import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ProjectsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const projects = await prisma.project.findMany({
    where: { userId },
    include: { client: true, invoices: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-zinc-500">{projects.length} total projects</p>
        </div>
        <Button>+ New Project</Button>
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
                <Badge variant={project.status === "ACTIVE" ? "default" : "secondary"}>
                  {project.status}
                </Badge>
                <span className="text-sm text-zinc-400">
                  {project.invoices.length} invoices
                </span>
                <Link href={`/projects/${project.id}`} className="text-sm text-blue-400 hover:underline">
                  View →
                </Link>
              </div>
            </div>
            {project.githubRepo && (
              <p className="mt-2 text-xs text-zinc-600">📦 {project.githubRepo}</p>
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
