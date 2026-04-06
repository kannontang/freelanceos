/**
 * Test the full agent email flow
 * Usage: OPENAI_API_KEY=$OPENROUTER_API_KEY DEMO_USER_ID=<id> pnpm exec tsx scripts/test-agent-email.ts
 */
import { PaymentFollowUpAgent } from "../agents/payment-followup";

async function main() {
  const userId = process.env.DEMO_USER_ID;
  if (!userId) {
    console.error("Set DEMO_USER_ID env var");
    process.exit(1);
  }

  const agent = new PaymentFollowUpAgent(userId);
  const overdue = await agent.checkOverdueInvoices();

  console.log(`Found ${overdue.length} overdue invoice(s)`);

  if (overdue.length > 0) {
    console.log("Processing first overdue invoice...");
    const result = await agent.sendReminder(overdue[0].invoiceId);
    console.log("Email result:", JSON.stringify(result, null, 2));
  } else {
    console.log("No overdue invoices to process.");
  }
}

main().catch(console.error);
