/**
 * Run agents directly via Prisma (no HTTP needed).
 * Usage: pnpm exec tsx scripts/run-agents.ts [payment-followup|onboarding|all]
 */
import { PrismaClient } from "@prisma/client";
import { PaymentFollowUpAgent } from "../agents/payment-followup";
import { OnboardingAgent } from "../agents/onboarding";

const prisma = new PrismaClient();

async function runPaymentFollowUp() {
  console.log("💰 Running PaymentFollowUpAgent...");
  const users = await prisma.user.findMany();
  let totalActions = 0;

  for (const user of users) {
    const agent = new PaymentFollowUpAgent(user.id);
    const overdue = await agent.checkOverdueInvoices();
    if (overdue.length > 0) {
      console.log(`  User ${user.id}: ${overdue.length} overdue invoice(s)`, overdue.map(o => `#${o.invoiceId} (${o.type})`));
      totalActions += overdue.length;
    }
  }

  console.log(`✅ PaymentFollowUp complete. ${totalActions} action(s) found.`);
  return totalActions;
}

async function main() {
  const arg = process.argv[2] ?? "all";

  if (arg === "payment-followup" || arg === "all") {
    await runPaymentFollowUp();
  }
  if (arg === "onboarding" || arg === "all") {
    console.log("📋 OnboardingAgent: checking pending forms...");
    // TODO: check onboarding form expiry, send reminder if expired
  }

  console.log("\n✅ All agents finished.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
