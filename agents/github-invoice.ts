import { prisma } from "@/lib/prisma";
import { analyzeCommits } from "@/lib/claude";

export class GitHubInvoiceAgent {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async processWebhook(payload: {
    repository: { full_name: string };
    commits: Array<{
      id: string;
      message: string;
      author: { name: string };
      timestamp: string;
      added?: string[];
      removed?: string[];
      modified?: string[];
    }>;
  }) {
    const repoFullName = payload.repository.full_name;

    // Find project by GitHub repo
    const project = await prisma.project.findFirst({
      where: {
        userId: this.userId,
        githubRepo: { contains: repoFullName },
      },
      include: { client: true },
    });

    if (!project) {
      return { success: false, reason: "No project linked to this repository" };
    }

    if (project.status !== "ACTIVE") {
      return { success: false, reason: "Project is not active" };
    }

    // Convert commits to analysis format
    const commits = payload.commits.map((c) => ({
      sha: c.id,
      message: c.message,
      author: c.author.name,
      timestamp: c.timestamp,
      additions: (c.added?.length ?? 0) * 5, // rough estimate
      deletions: (c.removed?.length ?? 0) * 3,
      files: [...(c.added ?? []), ...(c.modified ?? [])],
    }));

    // Use Claude to analyze commits and estimate hours
    const timeEntries = await analyzeCommits(commits);

    // Calculate total hours and amount
    const totalHours = timeEntries.reduce((sum, e) => sum + e.estimatedHours, 0);
    const rate = project.hourlyRate ?? 0;
    const amount = totalHours * rate;

    // Log activity
    await prisma.agentActivity.create({
      data: {
        userId: this.userId,
        agentType: "GITHUB_INVOICE",
        action: `GitHub webhook processed for ${repoFullName}: ${totalHours.toFixed(1)}h estimated`,
        status: "success",
        details: {
          repo: repoFullName,
          projectId: project.id,
          commits: commits.length,
          timeEntries,
          totalHours,
          estimatedAmount: amount,
        },
      },
    });

    return {
      success: true,
      projectId: project.id,
      commits: commits.length,
      timeEntries,
      totalHours,
      estimatedAmount: amount,
    };
  }
}
