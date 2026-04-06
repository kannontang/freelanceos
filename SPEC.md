# FreelanceOS — Implementation Spec

> This spec is derived from PRD.md and describes the production implementation.

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | Clerk |
| Payments | Stripe |
| Email | Resend |
| AI | Claude API (Anthropic) |
| Hosting | Vercel |

---

## 2. Project Structure

```
freelanceos/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── layout.tsx        # Dashboard layout with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx      # Main dashboard
│   │   ├── projects/
│   │   │   └── page.tsx      # Projects list
│   │   ├── invoices/
│   │   │   └── page.tsx      # Invoices list
│   │   ├── clients/
│   │   │   └── page.tsx      # Clients list
│   │   └── settings/
│   │       └── page.tsx      # Settings page
│   ├── api/
│   │   └── webhooks/
│   │       ├── github/route.ts
│   │       └── stripe/route.ts
│   ├── sign-in/
│   │   └── [[...sign-in]]/page.tsx
│   ├── sign-up/
│   │   └── [[...sign-up]]/page.tsx
│   ├── layout.tsx             # Root layout with ClerkProvider
│   ├── page.tsx               # Root page (redirect)
│   └── globals.css
├── components/
│   ├── ui/                    # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   └── select.tsx
│   └── dashboard/            # Dashboard-specific components
│       ├── agent-activity-feed.tsx
│       ├── pending-actions.tsx
│       └── cash-flow-timeline.tsx
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   ├── auth.ts                # Clerk auth helpers
│   ├── stripe.ts              # Stripe client
│   ├── resend.ts              # Resend email client
│   ├── claude.ts              # Claude API helpers
│   └── utils.ts               # General utilities
├── agents/
│   ├── payment-followup.ts    # PaymentFollowUpAgent
│   ├── onboarding.ts          # OnboardingAgent
│   ├── compliance.ts          # ComplianceMonitorAgent
│   └── github-invoice.ts      # GitHubInvoiceAgent
├── emails/
│   ├── client-onboarding.tsx  # Onboarding email template
│   └── payment-reminder.tsx   # Payment reminder template
├── prisma/
│   └── schema.prisma          # Database schema
├── types/
│   └── index.ts               # TypeScript interfaces
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .env.example
└── SPEC.md
```

---

## 3. Database Schema

All models defined in `prisma/schema.prisma`:
- User, Client, Project, Invoice, PaymentFollowUp
- OnboardingForm, ScopeCreepEvent, ComplianceAlert, Integration, AgentActivity

---

## 4. Agent Architecture

### PaymentFollowUpAgent
- Runs daily via cron job (or Vercel Cron)
- Checks for overdue invoices
- Drafts follow-up emails via Claude
- **Requires human approval** before sending any email
- Tracks all communication in PaymentFollowUp table

### GitHubInvoiceAgent
- Triggered by GitHub webhook on push events
- Reads commit metadata (messages, files changed)
- Uses Claude to estimate billable hours
- Creates draft time entries linked to project

### ComplianceMonitorAgent
- Runs weekly (cron job)
- Checks COMPLIANCE_RULES database for relevant regulations
- Creates ComplianceAlert records for new applicable rules
- Alerts user in dashboard

### OnboardingAgent
- Triggered when new project created
- Generates onboarding link with token
- Sends email to client
- Tracks form completion status

---

## 5. API Design

### GitHub Webhook
```
POST /api/webhooks/github
Body: GitHub push event payload
Auth: X-Hub-Signature-256 header
```

### Stripe Webhook
```
POST /api/webhooks/stripe
Body: Stripe event payload
Auth: Stripe-Signature header
```

---

## 6. Environment Variables

```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Resend
RESEND_API_KEY=re_...

# Claude
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 7. Security Notes

- All financial emails require human approval (no autonomous send for payments)
- GitHub/Stripe webhooks validated via signature verification
- Clerk handles auth — no custom auth needed
- Agent activity logged for audit trail
- GDPR: No personal data stored outside EU/Asia compliance scope

---

*Last updated: 2026-04-06*
