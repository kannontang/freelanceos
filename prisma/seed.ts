import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.agentActivity.deleteMany();
  await prisma.paymentFollowUp.deleteMany();
  await prisma.onboardingForm.deleteMany();
  await prisma.scopeCreepEvent.deleteMany();
  await prisma.complianceAlert.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.project.deleteMany();
  await prisma.integration.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const user = await prisma.user.create({
    data: {
      clerkId: "user_demo_korbin",
      email: "korbin@freelanceos.dev",
      name: "Korbin",
      timezone: "Asia/Hong_Kong",
      currency: "USD",
      hourlyRate: 150,
    },
  });
  console.log(`  ✓ Created user: ${user.name}`);

  // Create 3 clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        userId: user.id,
        name: "Sarah Chen",
        email: "sarah@acmecorp.com",
        company: "Acme Corp",
        phone: "+1-415-555-0101",
        country: "US",
        notes: "Prefers Slack communication. Net-30 payment terms.",
      },
    }),
    prisma.client.create({
      data: {
        userId: user.id,
        name: "Marcus Weber",
        email: "marcus@techstartgmbh.de",
        company: "TechStart GmbH",
        phone: "+49-30-555-0202",
        vatNumber: "DE123456789",
        country: "DE",
        notes: "German VAT registered. Invoices in EUR preferred.",
      },
    }),
    prisma.client.create({
      data: {
        userId: user.id,
        name: "Priya Patel",
        email: "priya@novadesign.io",
        company: "Nova Design Studio",
        phone: "+44-20-555-0303",
        country: "GB",
        notes: "Design agency. Usually has tight deadlines.",
      },
    }),
  ]);
  console.log(`  ✓ Created ${clients.length} clients`);

  // Create 2 projects per client
  const now = new Date();
  const projects = await Promise.all([
    // Acme Corp projects
    prisma.project.create({
      data: {
        userId: user.id,
        clientId: clients[0].id,
        name: "Acme Dashboard Redesign",
        description: "Complete redesign of the internal analytics dashboard with new charting library.",
        status: "ACTIVE",
        hourlyRate: 175,
        budget: 25000,
        startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
        githubRepo: "acmecorp/dashboard-v2",
      },
    }),
    prisma.project.create({
      data: {
        userId: user.id,
        clientId: clients[0].id,
        name: "Acme API Integration",
        description: "Third-party payment gateway integration with webhook handling.",
        status: "COMPLETED",
        hourlyRate: 175,
        budget: 12000,
        startDate: new Date(now.getFullYear(), now.getMonth() - 5, 10),
        endDate: new Date(now.getFullYear(), now.getMonth() - 1, 20),
        githubRepo: "acmecorp/api-gateway",
      },
    }),
    // TechStart projects
    prisma.project.create({
      data: {
        userId: user.id,
        clientId: clients[1].id,
        name: "TechStart Mobile App",
        description: "React Native mobile app for their SaaS platform.",
        status: "ACTIVE",
        hourlyRate: 160,
        budget: 40000,
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
        endDate: new Date(now.getFullYear(), now.getMonth() + 3, 30),
      },
    }),
    prisma.project.create({
      data: {
        userId: user.id,
        clientId: clients[1].id,
        name: "TechStart Landing Page",
        description: "Marketing landing page with A/B testing setup.",
        status: "COMPLETED",
        hourlyRate: 150,
        budget: 5000,
        startDate: new Date(now.getFullYear(), now.getMonth() - 3, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() - 2, 15),
      },
    }),
    // Nova Design projects
    prisma.project.create({
      data: {
        userId: user.id,
        clientId: clients[2].id,
        name: "Nova Portfolio Platform",
        description: "Custom portfolio platform for their design team with CMS integration.",
        status: "ACTIVE",
        hourlyRate: 165,
        budget: 18000,
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 2, 28),
      },
    }),
    prisma.project.create({
      data: {
        userId: user.id,
        clientId: clients[2].id,
        name: "Nova Brand Site",
        description: "Corporate brand website with Contentful CMS.",
        status: "ONBOARDING",
        hourlyRate: 150,
        budget: 8000,
        startDate: new Date(now.getFullYear(), now.getMonth(), 15),
      },
    }),
  ]);
  console.log(`  ✓ Created ${projects.length} projects`);

  // Create 5 invoices (mixed statuses)
  const invoices = await Promise.all([
    // Paid invoice
    prisma.invoice.create({
      data: {
        userId: user.id,
        clientId: clients[0].id,
        projectId: projects[1].id,
        number: `INV-${now.getFullYear()}${String(now.getMonth()).padStart(2, "0")}-0001`,
        status: "PAID",
        amount: 12000,
        currency: "USD",
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
        paidAt: new Date(now.getFullYear(), now.getMonth() - 1, 12),
        lineItems: [
          { description: "API Integration — Phase 1", hours: 40, rate: 175, amount: 7000 },
          { description: "API Integration — Phase 2", hours: 28.57, rate: 175, amount: 5000 },
        ],
        notes: "Thank you for prompt payment!",
      },
    }),
    // Paid invoice (TechStart)
    prisma.invoice.create({
      data: {
        userId: user.id,
        clientId: clients[1].id,
        projectId: projects[3].id,
        number: `INV-${now.getFullYear()}${String(now.getMonth()).padStart(2, "0")}-0002`,
        status: "PAID",
        amount: 5000,
        currency: "USD",
        vatRate: 19,
        vatAmount: 950,
        dueDate: new Date(now.getFullYear(), now.getMonth() - 2, 28),
        paidAt: new Date(now.getFullYear(), now.getMonth() - 2, 25),
        lineItems: [
          { description: "Landing Page Design & Development", hours: 33.33, rate: 150, amount: 5000 },
        ],
      },
    }),
    // Sent / pending invoice
    prisma.invoice.create({
      data: {
        userId: user.id,
        clientId: clients[0].id,
        projectId: projects[0].id,
        number: `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-0003`,
        status: "SENT",
        amount: 8750,
        currency: "USD",
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
        lineItems: [
          { description: "Dashboard Redesign — Sprint 3", hours: 50, rate: 175, amount: 8750 },
        ],
      },
    }),
    // Overdue invoice
    prisma.invoice.create({
      data: {
        userId: user.id,
        clientId: clients[1].id,
        projectId: projects[2].id,
        number: `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-0004`,
        status: "OVERDUE",
        amount: 9600,
        currency: "USD",
        vatRate: 19,
        vatAmount: 1824,
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10),
        lineItems: [
          { description: "Mobile App — Sprint 1", hours: 60, rate: 160, amount: 9600 },
        ],
      },
    }),
    // Draft invoice
    prisma.invoice.create({
      data: {
        userId: user.id,
        clientId: clients[2].id,
        projectId: projects[4].id,
        number: `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-0005`,
        status: "DRAFT",
        amount: 4950,
        currency: "USD",
        dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        lineItems: [
          { description: "Portfolio Platform — Initial Setup", hours: 30, rate: 165, amount: 4950 },
        ],
        notes: "Draft — waiting for milestone confirmation.",
      },
    }),
  ]);
  console.log(`  ✓ Created ${invoices.length} invoices`);

  // Payment follow-ups for overdue invoice
  await Promise.all([
    prisma.paymentFollowUp.create({
      data: {
        invoiceId: invoices[3].id,
        type: "POLITE_REMINDER",
        sentAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
        channel: "email",
        message: "Hi Marcus, just a friendly reminder that invoice INV-0004 was due last week. Let me know if you have any questions!",
        opened: true,
      },
    }),
    prisma.paymentFollowUp.create({
      data: {
        invoiceId: invoices[3].id,
        type: "FIRM_REMINDER",
        sentAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
        channel: "email",
        message: "Hi Marcus, this is a follow-up regarding invoice INV-0004 ($9,600) which is now 8 days overdue. Could you please arrange payment at your earliest convenience?",
        opened: false,
      },
    }),
  ]);
  console.log("  ✓ Created payment follow-ups");

  // Onboarding forms
  await prisma.onboardingForm.create({
    data: {
      clientId: clients[2].id,
      fields: {
        sections: [
          { title: "Project Goals", questions: ["What are your primary goals?", "Who is the target audience?"] },
          { title: "Brand Guidelines", questions: ["Do you have existing brand guidelines?", "Preferred color palette?"] },
          { title: "Communication", questions: ["Preferred communication channel?", "Availability for meetings?"] },
        ],
      },
      responses: {
        "What are your primary goals?": "Build a modern portfolio showcasing our team's work",
        "Who is the target audience?": "Potential enterprise clients in tech and finance",
      },
      completed: false,
      expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
    },
  });
  console.log("  ✓ Created onboarding forms");

  // Compliance alerts
  await Promise.all([
    prisma.complianceAlert.create({
      data: {
        userId: user.id,
        projectId: projects[2].id,
        title: "German VAT Rate Change",
        description: "Germany is updating VAT reporting requirements for digital services effective Q3 2026. Ensure invoices to TechStart GmbH include updated format.",
        severity: "WARNING",
        region: "EU",
        regulation: "EU VAT Directive 2006/112/EC",
      },
    }),
    prisma.complianceAlert.create({
      data: {
        userId: user.id,
        title: "UK IR35 Compliance Check",
        description: "Review your engagement with Nova Design Studio to ensure IR35 compliance for UK-based freelance work.",
        severity: "INFO",
        region: "UK",
        regulation: "IR35",
      },
    }),
  ]);
  console.log("  ✓ Created compliance alerts");

  // Agent activities
  const agentActivities = [
    { agentType: "payment-followup", action: "Sent polite reminder for INV-0004 to TechStart GmbH", status: "success", details: { invoiceId: invoices[3].id, type: "POLITE_REMINDER" } },
    { agentType: "payment-followup", action: "Sent firm reminder for INV-0004 to TechStart GmbH", status: "success", details: { invoiceId: invoices[3].id, type: "FIRM_REMINDER" } },
    { agentType: "github-invoice", action: "Detected 12 commits on acmecorp/dashboard-v2 — logged 6.5 billable hours", status: "success", details: { repo: "acmecorp/dashboard-v2", commits: 12, hours: 6.5 } },
    { agentType: "compliance", action: "Flagged German VAT reporting change for TechStart GmbH project", status: "success", details: { region: "EU", regulation: "VAT Directive" } },
    { agentType: "onboarding", action: "Sent onboarding form to Priya Patel at Nova Design Studio", status: "success", details: { clientId: clients[2].id } },
    { agentType: "github-invoice", action: "Detected 8 commits on nova-portfolio — logged 4.0 billable hours", status: "success", details: { repo: "nova-design/portfolio", commits: 8, hours: 4.0 } },
    { agentType: "compliance", action: "Checked UK IR35 status for Nova Design engagement", status: "success", details: { region: "UK", regulation: "IR35" } },
    { agentType: "onboarding", action: "Partial response received from Nova Design onboarding form", status: "pending", details: { clientId: clients[2].id, completionRate: 0.4 } },
  ];

  for (let i = 0; i < agentActivities.length; i++) {
    await prisma.agentActivity.create({
      data: {
        userId: user.id,
        ...agentActivities[i],
        createdAt: new Date(now.getTime() - (agentActivities.length - i) * 3600000),
      },
    });
  }
  console.log(`  ✓ Created ${agentActivities.length} agent activities`);

  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
