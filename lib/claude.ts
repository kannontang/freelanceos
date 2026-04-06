import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("Missing ANTHROPIC_API_KEY");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateText(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt ?? "You are a helpful assistant for FreelanceOS, an autonomous AI platform for freelancers.",
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  if (block.type === "text") {
    return block.text;
  }
  throw new Error("Unexpected response type from Claude API");
}

export async function generateStructured<T>(
  prompt: string,
  systemPrompt: string
): Promise<T> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: `${systemPrompt}\n\nYou MUST respond with valid JSON only. No markdown, no code fences, no explanation.`,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  if (block.type === "text") {
    return JSON.parse(block.text) as T;
  }
  throw new Error("Unexpected response type from Claude API");
}

export async function analyzeCommits(commits: Array<{
  message: string;
  additions: number;
  deletions: number;
  files: string[];
}>): Promise<Array<{ description: string; estimatedHours: number }>> {
  const prompt = `Analyze these git commits and estimate the development time for each.
Return a JSON array of objects with "description" (brief task summary) and "estimatedHours" (number).

Commits:
${commits.map((c) => `- ${c.message} (+${c.additions}/-${c.deletions} in ${c.files.length} files: ${c.files.slice(0, 5).join(", ")})`).join("\n")}`;

  return generateStructured<Array<{ description: string; estimatedHours: number }>>(
    prompt,
    "You are a senior developer estimating billable hours from git commits. Be accurate and fair — round to nearest 0.5 hours. Consider complexity, not just line count."
  );
}

export async function detectScopeCreep(
  projectScope: string,
  request: string
): Promise<{ isOutOfScope: boolean; confidence: number; explanation: string; suggestedCost: number | null }> {
  const prompt = `Original project scope:\n${projectScope}\n\nNew client request:\n${request}\n\nAnalyze whether this request is within the agreed project scope or represents scope creep.
Return JSON with: isOutOfScope (boolean), confidence (0-1), explanation (string), suggestedCost (number or null if in scope).`;

  return generateStructured(
    prompt,
    "You are a project management expert analyzing scope creep for freelancers. Be precise and fair to both parties."
  );
}

export async function draftFollowUpEmail(context: {
  clientName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  daysOverdue: number;
  previousFollowUps: number;
}): Promise<{ subject: string; body: string }> {
  const tone =
    context.daysOverdue <= 3
      ? "polite and friendly"
      : context.daysOverdue <= 7
        ? "professional and firm"
        : "urgent but still professional";

  const prompt = `Draft a payment follow-up email with a ${tone} tone.
Client: ${context.clientName}
Invoice: ${context.invoiceNumber}
Amount: ${context.amount} ${context.currency}
Days overdue: ${context.daysOverdue}
Previous follow-ups sent: ${context.previousFollowUps}

Return JSON with "subject" and "body" (plain text, no HTML).`;

  return generateStructured(
    prompt,
    "You are a professional business communications writer. Write concise, effective payment follow-up emails that maintain good client relationships."
  );
}
