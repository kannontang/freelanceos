import { NextRequest, NextResponse } from "next/server";
import { GitHubInvoiceAgent } from "@/agents/github-invoice";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Basic validation
    if (!payload.repository?.full_name || !payload.commits) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Validate GitHub webhook signature in production
    const signature = req.headers.get("x-hub-signature-256");
    if (!signature && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // TODO: In production, look up the user by GitHub repo from integrations table
    // For now, this requires auth — the webhook handler should extract userId
    // from the repository name or a stored GitHub integration

    const agent = new GitHubInvoiceAgent("placeholder-user-id"); // TODO: resolve from DB
    const result = await agent.processWebhook(payload);

    return NextResponse.json(result);
  } catch (error) {
    console.error("GitHub webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
