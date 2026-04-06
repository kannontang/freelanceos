import { prisma } from "@/lib/prisma";

type Region = "EU" | "ASIA" | "US";

interface ComplianceRule {
  region: Region;
  country?: string;
  regulation: string;
  description: string;
  action: string;
  deadline?: Date;
  severity: "INFO" | "WARNING" | "CRITICAL";
}

const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    region: "EU",
    country: "FR",
    regulation: "E-invoicing mandate 2026",
    description: "France requires B2B e-invoices in EN 16931 XML format from September 2026",
    action: "Update invoice templates to generate XML/UBL format invoices for French clients",
    deadline: new Date("2026-09-01"),
    severity: "WARNING",
  },
  {
    region: "EU",
    country: "DE",
    regulation: "Kleinunternehmerregelung",
    description: "German freelancers with < €22,000/year revenue can opt for simplified VAT handling",
    action: "Review VAT settings if you have German clients",
    severity: "INFO",
  },
  {
    region: "EU",
    regulation: "EU VAT E-invoicing 2028",
    description: "Full EU B2B e-invoicing mandate coming in 2028 — all member states",
    action: "Start planning migration to XML/UBL invoice format",
    deadline: new Date("2028-01-01"),
    severity: "INFO",
  },
  {
    region: "ASIA",
    country: "JP",
    regulation: "Freelance Act (Nov 2024)",
    description: "Japan's Specified Unpaid Wage Separation Act requires written contracts, 60-day payment terms",
    action: "Ensure all Japanese client contracts include payment terms and written format",
    severity: "WARNING",
  },
  {
    region: "ASIA",
    country: "SG",
    regulation: "GST registration threshold",
    description: "Singapore GST mandatory when turnover exceeds SGD 1 million",
    action: "Monitor annual revenue if operating in Singapore",
    severity: "INFO",
  },
  {
    region: "EU",
    country: "FR",
    regulation: "Loi Pinyon / Reclassification risk",
    description: "Freelancers in France face social charges reclassification if client relationship looks like employment",
    action: "Review contracts and client relationships for French projects",
    severity: "CRITICAL",
  },
];

export class ComplianceMonitorAgent {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async checkCompliance() {
    // Get user's clients and projects to determine relevant regulations
    const clients = await prisma.client.findMany({
      where: { userId: this.userId },
      select: { country: true },
    });

    const countries = [...new Set(clients.map((c) => c.country).filter(Boolean))] as string[];

    const applicableRules = COMPLIANCE_RULES.filter((rule) => {
      if (!rule.country) return rule.region === "EU" || rule.region === "ASIA";
      return countries.includes(rule.country);
    });

    const results = [];
    for (const rule of applicableRules) {
      // Check if we already have an unread alert for this rule
      const existing = await prisma.complianceAlert.findFirst({
        where: {
          userId: this.userId,
          regulation: rule.regulation,
          dismissed: false,
        },
      });

      if (!existing) {
        const alert = await prisma.complianceAlert.create({
          data: {
            userId: this.userId,
            title: `${rule.country ?? rule.region}: ${rule.regulation}`,
            description: rule.description,
            severity: rule.severity,
            region: rule.country ?? rule.region,
            regulation: rule.regulation,
            actionUrl: null,
          },
        });
        results.push(alert);
      }
    }

    return results;
  }

  async getAlerts() {
    return prisma.complianceAlert.findMany({
      where: { userId: this.userId, dismissed: false },
      orderBy: { severity: "desc" },
    });
  }
}
