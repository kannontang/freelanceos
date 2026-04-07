/**
 * Run agents directly via Prisma (no HTTP needed).
 * Usage: pnpm exec tsx scripts/run-agents.ts [onboarding|compliance|all]
 */
// LangChain OpenAI reads OPENAI_API_KEY — mirror OpenRouter key here
process.env.OPENAI_API_KEY = process.env.OPENROUTER_API_KEY;

import { PrismaClient } from "@prisma/client";
import { OnboardingAgent } from "../agents/onboarding";

const prisma = new PrismaClient();

async function runOnboarding() {
  console.log("📋 OnboardingAgent: checking pending forms...");
  // TODO: check onboarding form expiry, send reminder if expired
}

async function main() {
  const arg = process.argv[2] ?? "all";

  if (arg === "onboarding" || arg === "all") {
    await runOnboarding();
  }

  console.log("\n✅ All agents finished.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
