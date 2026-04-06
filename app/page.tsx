import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export const metadata = {
  title: "FreelanceOS — Your Freelance Admin Runs Itself",
  description:
    "AI agents handle invoicing, client follow-ups, and compliance for freelance developers and designers in Europe and Asia. Start free today.",
};

const painPoints = [
  {
    title: "Invoices chasing you",
    description:
      "You finished the project weeks ago, but the invoice is still sitting in a draft somewhere. Reminders? Forget it.",
  },
  {
    title: "Client onboarding chaos",
    description:
      "Contracts, NDAs, briefs, kick-off calls — every new client is a scavenger hunt through your inbox.",
  },
  {
    title: "Compliance blind spots",
    description:
      "VAT rules change, tax deadlines sneak up, and you're never quite sure if you're doing it right.",
  },
];

const steps = [
  {
    icon: "🔗",
    title: "Connect your tools",
    description:
      "Link your email, calendar, and bank account. FreelanceOS maps your workflow in minutes.",
  },
  {
    icon: "🤖",
    title: "Agents take over admin",
    description:
      "Autonomous agents draft invoices, send follow-ups, and flag compliance issues — without prompting.",
  },
  {
    icon: "📊",
    title: "You stay in control",
    description:
      "Review, approve, or override anything from a single dashboard. Nothing ships without your say.",
  },
];

const features = [
  {
    emoji: "🧾",
    title: "Auto-invoicing",
    description:
      "Agents generate, send, and chase invoices. Supports EU e-invoicing and Asian formats.",
  },
  {
    emoji: "🌍",
    title: "Multi-currency & VAT",
    description:
      "Handles EUR, GBP, SGD, HKD, and more. VAT/GST calculated automatically per jurisdiction.",
  },
  {
    emoji: "📬",
    title: "Smart follow-ups",
    description:
      "AI-timed reminders that land when clients are most likely to pay — no more awkward chasing.",
  },
  {
    emoji: "📋",
    title: "Client onboarding flows",
    description:
      "Contracts, NDAs, and briefs assembled and sent automatically when a deal closes.",
  },
  {
    emoji: "🔒",
    title: "GDPR & compliance",
    description:
      "Built-in checks for EU data rules, IR35, and local tax obligations across Europe and Asia.",
  },
  {
    emoji: "📈",
    title: "Revenue dashboard",
    description:
      "Real-time view of income, outstanding invoices, and tax reserves — no spreadsheet needed.",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For freelancers just getting started.",
    features: [
      "Up to 3 clients",
      "5 invoices/month",
      "Basic compliance alerts",
      "Email support",
    ],
    cta: "Start Free",
    variant: "outline" as const,
    href: "/sign-up",
  },
  {
    name: "Pro",
    price: "€19",
    period: "/month",
    description: "For active freelancers who want full automation.",
    features: [
      "Unlimited clients",
      "Unlimited invoices",
      "AI follow-ups & onboarding",
      "Multi-currency & VAT",
      "Priority support",
    ],
    cta: "Start Free Trial",
    variant: "default" as const,
    popular: true,
    href: "/sign-up",
  },
  {
    name: "Business",
    price: "€49",
    period: "/month",
    description: "For freelancers running a serious operation.",
    features: [
      "Everything in Pro",
      "Team collaboration (up to 5)",
      "Custom agent workflows",
      "Dedicated account manager",
      "API access",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    variant: "outline" as const,
    href: "/sign-up",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <header className="border-b border-zinc-800">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">FreelanceOS</span>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <Badge className="mb-6">AI-powered freelance admin</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Your Freelance Admin
          <br />
          Runs Itself.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
          AI agents handle invoicing, client follow-ups, and compliance — 24/7.
          Built for freelance developers and designers in Europe and Asia.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/sign-up">
            <Button size="lg">Start Free</Button>
          </Link>
          <Button variant="outline" size="lg">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Pain Points */}
      <section className="border-t border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              The admin nightmare every freelancer knows
            </h2>
            <p className="mt-4 text-zinc-400">
              You didn&apos;t go freelance to spend half your time on paperwork.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {painPoints.map((point) => (
              <Card key={point.title}>
                <CardHeader>
                  <CardTitle>{point.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{point.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Autonomous agents, not just AI writing
            </h2>
            <p className="mt-4 text-zinc-400">
              FreelanceOS agents act on your behalf — they don&apos;t just
              suggest, they execute.
            </p>
          </div>
          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-3xl">
                  {step.icon}
                </div>
                <p className="mt-2 text-sm text-zinc-500">Step {i + 1}</p>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Built for EU &amp; Asia freelancers
            </h2>
            <p className="mt-4 text-zinc-400">
              Not another US-only tool. FreelanceOS understands your tax rules,
              currencies, and compliance needs.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="text-3xl">{feature.emoji}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-zinc-400">
              Start free. Upgrade when your business grows.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={
                  tier.popular ? "border-brand-500 ring-1 ring-brand-500" : ""
                }
              >
                <CardHeader>
                  {tier.popular && (
                    <Badge variant="default" className="w-fit">
                      Most popular
                    </Badge>
                  )}
                  <CardTitle>{tier.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-zinc-400">{tier.period}</span>
                  </div>
                  <CardDescription className="mt-2">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-zinc-300"
                      >
                        <span className="mt-0.5 text-emerald-400">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href={tier.href} className="w-full">
                    <Button variant={tier.variant} className="w-full">
                      {tier.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <span className="text-sm text-zinc-500">
            © 2026 FreelanceOS. All rights reserved.
          </span>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="/sign-in" className="hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/sign-up" className="hover:text-white transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
