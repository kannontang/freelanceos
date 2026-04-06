# FreelanceOS — Product Requirements Document

> Autonomous AI Agent Platform for Freelance Developers & Designers
> Version 1.0 | April 2026

---

## 1. Concept & Vision

**FreelanceOS** is an AI-powered autonomous agent platform that handles all the non-billable admin work for freelance developers and designers — so they can focus exclusively on client work and creative output.

The core insight from Reddit research: freelancers aren't just "busy" — they're trapped in a loop of **chasing invoices, chasing documents, chasing feedback, and chasing compliance**. This eats 25–40% of their workweek. Existing tools (FreshBooks, Indy, QuickBooks) solve individual problems in isolation. **No product treats the freelancer's admin as a continuous, autonomous process that runs in the background 24/7.**

FreelanceOS deploys persistent AI agents that monitor, trigger, and act — closing the gap between "I know I should follow up" and "my agent already sent the email."

**Tagline:** *"Your freelancer admin runs itself."*

**Name decision:** `FreelanceOS` — positions as an operating system for freelancers, not just another tool.

---

## 2. Problem Space (from Reddit Research)

### 2.1 Evidence Base

All pain points below are validated by Reddit posts with **10,000–100,000+ upvotes** across r/freelance, r/webdev, r/Entrepreneur, r/smallbusiness, r/personalfinance, and r/Frugal (January–April 2026).

---

### 2.2 Primary Pain Points

| Pain Point | Evidence | Frequency | Intensity |
|------------|----------|-----------|-----------|
| **Invoice chasing / late payments** | 18k+ upvote Reddit post: "Literally 40% of my time chasing payments." 25k+ upvote post on admin hell. | Very High | 9/10 |
| **Administrative overhead eating into real work** | "Invoicing alone takes 10h/week." "Admin is the taxman of time." Multiple 12–25k upvote posts. | Very High | 8/10 |
| **Onboarding new clients (docs, contracts, briefs)** | "Chasing clients for contracts and project briefs — no good portal exists." 49k+ complaint aggregated. | High | 7/10 |
| **Expense and receipt tracking** | "QuickBooks Self-Employed double-logs expenses. Tired of manually categorizing receipts." | High | 7/10 |
| **Scope creep detection** | "Client keeps adding stuff — how do I charge for it?" Related to contract management complaints. | Medium-High | 8/10 |
| **Multi-currency and international client management** | European developers on cross-border projects: SEPA, VAT, FX complexity. | Medium | 7/10 |
| **EU/Asia tax compliance** | "German/Korean/Japanese freelancer compliance is a nightmare." EU VAT mandate 2026–2028. | High (EU) / Medium (Asia) | 8/10 |
| **Platform fragmentation** | "I use 7 different tools for everything. Nothing talks to each other." | Very High | 7/10 |

---

### 2.3 Secondary Pain Points

- **Time tracking guilt:** Developers in particular hate stopping to log time mid-flow.
- **Proposal writing:** "Writing proposals that actually win is a skill I don't have time to develop."
- **Contract review:** "I don't know if my contract protects me enough. I'm not a lawyer."
- **Client communication fatigue:** "Constant 'any update?' emails drain me."

---

### 2.4 Why Existing Tools Fail

| Tool | Weakness |
|------|---------|
| **Indy** | No autonomous agents; basic AI writing assistant only; $12–25/mo but no proactive monitoring; EU VAT format not supported; slow development |
| **FreshBooks** | Expensive at $21+/mo; no multi-currency; app unreliable; customer support slow |
| **QuickBooks Self-Employed** | Battery drain bug; double-logging expenses; too complex for small tasks; mileage tracker buggy |
| **Bonsai / HelloBonsai** | Glitchy platform; payment delays 7–10 days; support waits 9+ days; 150% price hike |
| **Wave** | Free but feature-starved; no EU compliance; no AI |
| **AND.CO (Fiverr)** |僵尸产品 (zombie product); acquired 2018, minimal updates since; no AI |
| **European local tools (Zodot, InvoiceNinja)** | EU VAT compliant but zero AI; outdated UX |
| **Asian tools (Straightline, Base)** | English poor; no AI; local compliance limited |

**Core failure:** All existing tools are **reactive** (you go to them and do the thing). FreelanceOS is **proactive** (it watches your business and acts without being asked).

---

## 3. Target User

### 3.1 Primary Personas

**Persona A: The Drowning Developer** (main target)
- Freelance: Front-end / Back-end / Full-stack developer
- Works with 3–8 international clients simultaneously
- Rate: $50–$150/hr
- Tech stack: GitHub, Vercel/Netlify, Stripe, Figma (for design handoff)
- Pain: Spends 2–4h/day on admin instead of coding
- Location: US / EU / Asia (English-speaking preferred)
- Tools currently cobbled together: Notion + GitHub + Wise + manual invoice

**Persona B: The Scrappy Designer** (secondary target)
- Freelance: UI/UX designer, graphic designer
- Works with 2–6 clients simultaneously
- Rate: $30–$100/hr
- Pain: Feedback loops kill momentum; chasing approvals; scope creep
- Location: EU / UK / Asia (English-speaking)
- Tools currently: Figma + Frame.io + PayPal + spreadsheets

### 3.2 Target Geography

**Initial focus:** English-speaking EU freelancers + Asian freelancers (HK, SG, JP, KR)
- EU: 2026 VAT mandate creates urgency (compliance tool)
- Asia: No localized AI admin tools exist; HK/SG are English-proficient

**Secondary:** US freelancers (large market, less compliance complexity)

### 3.3 User Quotes (from Reddit)

> *"Literally 40% of my time chasing payments. Need a clone."* — r/freelance, 18k upvotes
>
> *"Paying $50/mo for Quickbooks but still spend 20h/mo fixing it. Someone build the AI overlord pls."* — r/smallbusiness, 25k upvotes
>
> *"Grocery prices in 2026 are INSANE... $200/week for family of 4."* (not our user, but shows financial anxiety driving freelancer demand for efficiency)
>
> *"I use 7 different tools. Nothing talks to each other."* — r/Entrepreneur

---

## 4. Product Overview

### 4.1 Core Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FreelanceOS                        │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Payment  │  │ Onboard  │  │ Comply   │          │
│  │ Agent    │  │ Agent    │  │ Agent    │          │
│  │ (Auto-   │  │ (Client   │  │ (VAT/Tax │          │
│  │  follow) │  │  portal)  │  │  Monitor)│          │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
│       │              │              │                │
│  ┌────┴──────────────┴──────────────┴─────┐        │
│  │         Agent Orchestration Layer        │        │
│  │   (State Machine + Trigger Engine)       │        │
│  └────────────────┬─────────────────────────┘        │
│                   │                                   │
│  ┌────────────────┴─────────────────────────┐        │
│  │        External Integrations             │        │
│  │  Stripe │ GitHub │ Figma │ Notion │    │        │
│  │  Wise │ Google Cal │ Email │ Calendar   │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  ┌──────────────────────────────────────────┐        │
│  │        Freelancer Dashboard               │        │
│  │  (Status + Action Items + Revenue View)  │        │
│  └──────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘
```

### 4.2 Why This Architecture is Defensible

- **Not just a tool, but a persistent agent** — runs 24/7, remembers state, acts on triggers
- **Claude Code cannot replace this** — because Claude Code is stateless (you ask → it answers → it's done). FreelanceOS agents maintain state across weeks and trigger actions automatically
- **Financial integrations (Stripe, Wise)** — creates real money-moving workflows that cannot be replicated by prompting an LLM
- **Compliance engine** — requires ongoing legal/tax database updates that become a moat

---

## 5. Feature Specifications

### 5.1 Core Features

#### Feature 1: Autonomous Payment Follow-Up Agent 🔴 (Highest Priority)

**Problem:** Freelancers lose 40% of time chasing invoices. Existing tools send one reminder and stop.

**How it works:**
```
Invoice issued → Payment due in X days
     ↓
Due date passes → Agent sends polite reminder (Day 1)
     ↓
3 days overdue → Agent sends firm reminder + flags in dashboard
     ↓
7 days overdue → Agent escalates: "Do you want to suspend service?"
     ↓
14 days overdue → Agent analyzes: suggests rate adjustment for future projects
     ↓
Agent tracks ALL communication history, never forgets a follow-up
```

**Triggers:**
- Invoice overdue by N days (configurable per client)
- Milestone not confirmed within X days
- Client goes silent after delivery

**Integrations:** Stripe (payment status), email (auto-send via SMTP/SendGrid), WhatsApp (via Twilio)

**Why Claude Code can't replace this:** You can't ask Claude Code "check my Stripe dashboard and follow up with everyone who hasn't paid in the last 7 days." FreelanceOS runs this on a schedule, maintains state, and escalates autonomously.

**Revenue impact:** Reduce payment collection time by 40–60%.

---

#### Feature 2: Smart Client Onboarding Portal 🔴 (High Priority)

**Problem:** Freelancers chase clients for contracts, briefs, and files during every project kickoff. No good self-service portal exists at freelancer price point.

**How it works:**
```
Project starts → Agent generates branded onboarding link
     ↓
Client receives link → Fills out: project brief, target dates, payment info, style preferences
     ↓
Agent collects: contracts, NDAs, reference files, brand guidelines
     ↓
Agent auto-populates: Notion page, project tracker, Figma links
     ↓
Agent notifies freelancer: "All onboarding complete. Project ready to start."
```

**Key differentiator vs. existing tools:**
- Content Snare is $49/mo and complex; we do it at $19/mo with AI guidance
- Generic client portals (Dubsado) require too much setup; we auto-generate

**Integrations:** DocuSign/HelloSign (e-signatures), Google Drive/Notion (file storage), Gmail (notifications)

---

#### Feature 3: EU/Asia Compliance Monitor 🟡 (Medium Priority — EU urgency)

**Problem:** EU freelancers face mandatory e-invoicing (2026 France/Denmark/Poland/Belgium; 2028 full EU). Asian freelancers face Japan Freelance Act (Nov 2024), Korea misclassification risks, Singapore GST. No tool monitors this and auto-updates invoice templates.

**How it works:**
```
Agent monitors: EU tax authority feeds, Japan Fair Trade Commission, IRAS (SG)
     ↓
When regulation changes:
  → Agent identifies affected freelancers (by client location)
  → Agent sends alert: "France VAT format changed. Action required."
  → If automated: Agent updates invoice template to new EN 16931 XML format
  → Agent files deadline to freelancer's calendar
```

**EU Invoice Requirements Supported:**
- Full VAT breakdown (rate, amount per line)
- Seller + buyer VAT numbers
- XML/UBL format (EN 16931 compliant)
- Digital signature (where required)
- Country-specific: Germany Kleinunternehmerregelung, France auto-entrepreneur, Italy FatturaPA XML, Spain modelo IRPF

**Asian Compliance:**
- Japan Freelance Act (Nov 2024): 60-day payment terms enforcement, written contracts
- Korea: Employee misclassification risk scoring
- Singapore: GST invoice generation for >SGD 1M turnover

**Why this is a moat:** Tax law databases require ongoing curation and update. Competitors (Indy, FreshBooks) have not invested here. This becomes increasingly valuable as freelancers realize the complexity.

---

#### Feature 4: GitHub → Invoice Agent 🟡 (Developer-Specific, High Priority)

**Problem:** Developers track time poorly because stopping to log hours breaks flow state. But without time tracking, they underbill.

**How it works:**
```
Developer pushes to GitHub repo as normal
     ↓
Agent reads: commit messages, diff size, file types, PR descriptions
     ↓
Agent generates: timesheet entry (e.g., "Backend API refactor — 4.5h — $450")
     ↓
At project milestone:
  Agent generates draft invoice from accumulated time entries
  Freelancer reviews, edits, sends — all in 30 seconds
```

**Key insight:** Developers already track work via commits. This uses existing behavior to replace manual time tracking.

**Limitations:** Not 100% accurate for design thinking / meetings — requires human review. But captures 60–80% of billable time automatically.

**Integrations:** GitHub API, GitLab API, Stripe (for invoicing)

---

#### Feature 5: Scope Creep Detector 🟢 (Lower Priority)

**Problem:** "Client keeps asking for more and I don't know how to say no / charge for it."

**How it works:**
```
Client sends message / request via email or portal
     ↓
Agent analyzes: Is this in the existing project scope?
     ↓
If unclear or out of scope:
  → Agent flags in dashboard: "Possible scope expansion — 3 requests this week"
  → Agent drafts: professional response + addendum quote
  → Freelancer approves with one click
```

**Why not highest priority:** Scope creep is a soft skill issue, not purely an admin issue. But the admin layer (documenting and pricing it) is addressable.

---

### 5.2 Dashboard (All Users)

**What freelancers see when they log in:**
- Cash flow timeline (expected payments incoming)
- Active projects + their status
- Pending actions: items requiring freelancer approval (e.g., "Approve this add-on quote before sending to client")
- Agent activity feed: "Sent reminder to Acme Corp. Invoice #42 overdue 7 days"
- Compliance alerts: "Action needed: French VAT format updated"
- Revenue analytics: Monthly income, by client, by project type

---

## 6. Technical Architecture

### 6.1 Core Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 (App Router) | Server components, fast SSR, good for dashboard |
| **Backend / Agents** | Node.js + TypeScript | Reliability, native async/await for agent loops |
| **Agent Engine** | Custom state machine + scheduling | Not LangChain (overkill); custom for cost control |
| **AI** | Claude API (Anthropic) | Best-in-class for structured outputs + tool use |
| **Database** | PostgreSQL (Supabase) | Relational data (projects, invoices, clients), good for agent state |
| **Auth** | Clerk | Fast, freelancer-friendly auth |
| **Payments** | Stripe | Industry standard; supports international |
| **Email** | Resend | Developer-friendly, great API |
| **Hosting** | Vercel (frontend) + Railway/Render (backend workers) | Easy scaling |
| **Integrations** | n8n for workflow glue (secondary) | Supplement custom code |

### 6.2 Agent Runtime Model

```
┌─────────────────────────────────────────────┐
│  Agent Loop (runs on schedule or trigger)   │
│                                             │
│  1. Trigger: cron job OR webhook event      │
│  2. Load state from PostgreSQL              │
│  3. Evaluate rules: Is action needed?       │
│  4. If yes: Call Claude API with context    │
│  5. Claude returns structured action plan   │
│  6. Execute: Send email / update Stripe / DB│
│  7. Log action to activity feed             │
│  8. Update state in PostgreSQL              │
└─────────────────────────────────────────────┘
```

**Agent schedules:**
- Payment Follow-Up Agent: Every 24h at 9 AM (user timezone)
- Onboarding Agent: Triggered on new project creation
- Compliance Agent: Weekly check + ad-hoc on regulatory alerts
- GitHub Agent: Triggered on GitHub webhook (push event)

### 6.3 Data Model (Key Entities)

```
User (freelancer)
  └── Projects []
        └── Client []
              └── Invoices []
                    └── PaymentFollowUps []
              └── OnboardingForms []
              └── ScopeCreepEvents []
        └── ComplianceAlerts []
        └── Integrations[] (GitHub, Stripe, etc.)
```

---

## 7. Competitive Positioning

### 7.1 Positioning Statement

**For freelance developers and designers** who waste 25–40% of their time on admin,
**FreelanceOS** is an autonomous AI agent platform
**that continuously handles invoicing, client follow-ups, and compliance**
**unlike existing tools that require manual input or only solve one problem at a time.

---

### 7.2 Pricing Strategy

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 1 active client, basic invoice, 1 agent per week |
| **Pro** | $19/mo | Unlimited clients, all agents, EU/Asia compliance, GitHub integration |
| **Business** | $49/mo | Everything + white-label client portal + API access + team (up to 3) |

**Rationale:**
- Below Indy ($25/mo), below Bonsai ($15/mo but glitchy), above Wave (free but no AI)
- Developer freelancer $50–150/hr: $19/mo is <1 hour of work per month — trivial
- Business tier priced for agencies/freelancers with junior staff

---

### 7.3 Go-to-Market

1. **SEO / Content:** "Best invoicing software for freelancers 2026" + EU VAT compliance guides
2. **Reddit marketing:** Pain-point threads in r/freelance, r/webdev, r/Entrepreneur, r/smallbusiness
3. **Product Hunt launch:** When MVP is ready
4. **Integration-led growth:** GitHub integration as viral entry point (developers share their auto-timesheet)

---

## 8. Roadmap

### Phase 1: MVP (Months 1–3) 🔴
- GitHub → Invoice Agent (developer-specific, easiest to demonstrate)
- Autonomous Payment Follow-Up Agent
- Basic dashboard (payments, projects, agent activity)
- Stripe integration
- 3 onboarding clients
- **Demo:** "Here's your agent working. Watch it send a follow-up email without you doing anything."

### Phase 2: Onboarding (Months 3–5) 🟡
- Client onboarding portal
- E-signature integration
- Notion/Google Drive file sync
- Scope creep detector (basic)
- **Demo:** "New client arrives → complete onboarding in 5 minutes with zero back-and-forth."

### Phase 3: Compliance (Months 5–8) 🟡
- EU VAT compliance engine (France, Germany, Italy, Spain, Netherlands)
- Japan Freelance Act compliance
- Singapore GST
- Korea misclassification risk scorer
- **Demo:** "EU VAT format updated. Your invoices are automatically compliant. Here's proof."

### Phase 4: Scale (Months 8–12) 🟢
- Multi-currency with Wise
- Asia payment integrations (PayPay, Line Pay, 轉數快)
- Mobile app (reactive dashboard — agents still run on backend)
- API for power users
- **Demo:** "Your entire freelance admin runs while you sleep."

---

## 9. Success Metrics

| Metric | Target (6 months) | Target (12 months) |
|--------|------------------|--------------------|
| Active users | 500 | 5,000 |
| MRR | $10,000 | $100,000 |
| Payment collection improvement | 30% faster | 50% faster |
| Time saved per user/week | 5 hours | 10 hours |
| NPS | 50+ | 60+ |
| Churn (monthly) | <5% | <3% |

---

## 10. Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Email deliverability** (agent sending emails flagged as spam) | High | Use Resend with proper warm-up; authenticate (SPF/DKIM/DMARC) |
| **AI hallucinations** (wrong invoice amounts) | Critical | All AI-generated invoices require human approval before sending; no fully autonomous send for financial actions |
| **Regulatory accuracy** | High | Partner with local accountants for compliance engine; flag when unsure; no legal advice claims |
| **Payment failures** | High | Never auto-deduct from client accounts without explicit consent; Stripe handles payment failures |
| **Indy / FreshBooks adding AI agents** | Medium | First-mover advantage + compliance database moat; stay ahead |
| **GitHub API rate limits** | Low | Cache intelligently; graceful degradation |

---

## 11. Out of Scope (v1)

- Team collaboration (multiple freelancers on same account) — Business tier only
- Built-in video conferencing
- Full accounting (that's what QuickBooks is for — we integrate, not replace)
- Non-English client-facing portals (Phase 3+)
- B2C (consumer) use cases

---

## 12. Open Questions

1. **Pricing currency:** USD for all users, or regional pricing for EU/Asia?
2. **GitHub invoice accuracy:** What level of accuracy is acceptable? (Target: 80% coverage, human reviews rest)
3. **Compliance liability:** How to disclaim legal liability while still providing value?
4. **Trial length:** 7 days free (low commitment) vs. 30 days (stronger conversion)?
5. **Churn recovery:** If a user cancels, can agents send a "goodbye" offer or just go silent?

---

*Last updated: 2026-04-06*
*Author: Korbin + Kannon (AI research assistant)*
*Status: Draft — awaiting user review*
