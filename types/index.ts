export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  timezone: string;
  currency: string;
  hourlyRate: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  vatNumber: string | null;
  country: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  clientId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  hourlyRate: number | null;
  budget: number | null;
  startDate: Date | null;
  endDate: Date | null;
  githubRepo: string | null;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
}

export type ProjectStatus =
  | "ONBOARDING"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

export interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  projectId: string | null;
  number: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  vatRate: number | null;
  vatAmount: number | null;
  dueDate: Date;
  paidAt: Date | null;
  stripeInvoiceId: string | null;
  lineItems: InvoiceLineItem[] | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
  project?: Project;
}

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export interface InvoiceLineItem {
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

export interface PaymentFollowUp {
  id: string;
  invoiceId: string;
  type: FollowUpType;
  sentAt: Date;
  channel: string;
  message: string;
  response: string | null;
  opened: boolean;
}

export type FollowUpType =
  | "POLITE_REMINDER"
  | "FIRM_REMINDER"
  | "ESCALATION"
  | "FINAL_NOTICE";

export interface OnboardingForm {
  id: string;
  clientId: string;
  token: string;
  fields: OnboardingField[];
  responses: Record<string, unknown> | null;
  completed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingField {
  key: string;
  label: string;
  type: "text" | "textarea" | "file" | "date" | "select";
  required: boolean;
  options?: string[];
}

export interface ScopeCreepEvent {
  id: string;
  clientId: string;
  projectId: string;
  description: string;
  source: string;
  severity: string;
  resolved: boolean;
  quoteSent: boolean;
  createdAt: Date;
}

export interface ComplianceAlert {
  id: string;
  userId: string;
  projectId: string | null;
  title: string;
  description: string;
  severity: AlertSeverity;
  region: string;
  regulation: string | null;
  actionUrl: string | null;
  dismissed: boolean;
  createdAt: Date;
}

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface Integration {
  id: string;
  userId: string;
  provider: string;
  accessToken: string | null;
  refreshToken: string | null;
  metadata: Record<string, unknown> | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentAction {
  id: string;
  agent: string;
  action: string;
  details: string;
  timestamp: Date;
  status: "success" | "pending" | "failed";
}

export interface DashboardStats {
  totalRevenue: number;
  pendingInvoices: number;
  activeProjects: number;
  overduePayments: number;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  timestamp: string;
  additions: number;
  deletions: number;
  files: string[];
}

export interface TimeEntry {
  description: string;
  hours: number;
  rate: number;
  date: string;
  source: "github" | "manual";
  commitSha?: string;
}
