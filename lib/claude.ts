/**
 * FreelanceOS LLM layer — OpenRouter + LangChain.js
 *
 * Models available via OpenRouter:
 *   - anthropic/claude-3.5-sonnet      (Claude family, best quality)
 *   - google/gemini-2.0-flash         (fast, cheap)
 *   - openai/gpt-4o                   (OpenAI flagship)
 *   - mistral/mistral-large-latest    (European model)
 *
 * Set OPENROUTER_API_KEY in .env to enable.
 * If key is missing/placeholder, functions throw a clear error.
 */

import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

// ─── Model selection ────────────────────────────────────────────────────────

const hasRealKey =
  process.env.OPENROUTER_API_KEY &&
  !process.env.OPENROUTER_API_KEY.includes("placeholder") &&
  process.env.OPENROUTER_API_KEY.startsWith("sk-or-");

const modelName = process.env.OPENROUTER_MODEL ?? "anthropic/claude-3.5-sonnet";

function getModel(): ChatOpenAI {
  if (!hasRealKey) {
    throw new Error(
      "[FreelanceOS LLM] OPENROUTER_API_KEY not set or is a placeholder. " +
        "Add your key to .env → OPENROUTER_API_KEY=sk-or-... and restart."
    );
  }
  // LangChain OpenAI reads OPENAI_API_KEY env var; mirror our key there
  return new ChatOpenAI({
    model: modelName,
    openAIApiKey: process.env.OPENROUTER_API_KEY,
    maxRetries: 2,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "FreelanceOS",
      },
    },
    temperature: 0.3,
    maxTokens: 2048,
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function generateText(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  const llm = getModel();
  const chain = PromptTemplate.fromTemplate(
    "{system}\n\n{prompt}"
  ).pipe(llm).pipe(new StringOutputParser());
  return chain.invoke({ system: systemPrompt, prompt });
}

async function generateStructured<T>(
  prompt: string,
  systemPrompt: string
): Promise<T> {
  const llm = getModel();
  // Ask for JSON explicitly
  const fullSystem = `${systemPrompt}\n\nRespond with valid JSON only. No markdown, no explanation, no code fences.`;
  const response = await generateText(prompt, fullSystem);
  // Strip markdown fences if present
  const cleaned = response.replace(/^```json\s*|```\s*$/gi, "").trim();
  return JSON.parse(cleaned) as T;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function generateCompletion(
  prompt: string,
  systemPrompt = "You are a helpful AI assistant for FreelanceOS."
): Promise<string> {
  return generateText(prompt, systemPrompt);
}

export async function analyzeCommits(
  commits: Array<{
    message: string;
    additions: number;
    deletions: number;
    files: string[];
  }>
): Promise<Array<{ description: string; estimatedHours: number }>> {
  const prompt = `Analyze these git commits and estimate billable hours.
Return a JSON array of objects: [{"description": "...", "estimatedHours": number}]

Commits:
${commits
  .map(
    (c) =>
      `- ${c.message} (+${c.additions}/-${c.deletions}, ${c.files.length} files: ${c.files.slice(0, 5).join(", ")})`
  )
  .join("\n")}`;

  return generateStructured(prompt, "Senior developer estimating billable hours. Round to nearest 0.5h.");
}

export async function detectScopeCreep(
  projectScope: string,
  request: string
): Promise<{
  isOutOfScope: boolean;
  confidence: number;
  explanation: string;
  suggestedCost: number | null;
}> {
  const prompt = `Original scope:\n${projectScope}\n\nNew request:\n${request}`;
  return generateStructured(
    prompt,
    "Project management expert analyzing scope creep. Return: {isOutOfScope, confidence (0-1), explanation, suggestedCost (number or null)}."
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

  const prompt = `Draft a payment follow-up email (${tone} tone).
Client: ${context.clientName}
Invoice: ${context.invoiceNumber}
Amount: ${context.amount} ${context.currency}
Days overdue: ${context.daysOverdue}
Previous follow-ups: ${context.previousFollowUps}

Return JSON: {"subject": "...", "body": "..."} (plain text, no HTML)`;

  return generateStructured(
    prompt,
    "Professional business communications writer for payment follow-ups."
  );
}

export async function draftClientOnboardingEmail(context: {
  clientName: string;
  projectName: string;
  freelancerName: string;
  onboardingUrl: string;
}): Promise<{ subject: string; body: string }> {
  const prompt = `Draft a client onboarding welcome email.
Client: ${context.clientName}
Project: ${context.projectName}
Freelancer: ${context.freelancerName}
Onboarding URL: ${context.onboardingUrl}`;

  return generateStructured(
    prompt,
    "Professional freelancer writing onboarding emails to new clients. Warm, clear, and actionable."
  );
}

export async function generateInvoiceDescription(
  projectName: string,
  commitSummary: string
): Promise<string> {
  const prompt = `Project: ${projectName}\nGit commits / work done:\n${commitSummary}`;
  return generateText(
    prompt,
    "You write concise, professional invoice line-item descriptions for freelance work. Focus on value delivered, not technical details."
  );
}
