import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createInvoiceSchema = z.object({
  clientId: z.string(),
  projectId: z.string().optional(),
  number: z.string(),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  vatRate: z.number().optional(),
  vatAmount: z.number().optional(),
  dueDate: z.string().transform((s) => new Date(s)),
  lineItems: z.array(z.object({
    description: z.string(),
    hours: z.number().optional(),
    rate: z.number().optional(),
    amount: z.number(),
  })).optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const status = searchParams.get("status");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const where: Record<string, unknown> = { userId };
  if (status) where.status = status;

  const invoices = await prisma.invoice.findMany({
    where,
    include: { client: true, project: true, paymentFollowUps: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invoices);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createInvoiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { clientId, projectId, ...data } = parsed.data;

  // Look up client to get userId
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const invoice = await prisma.invoice.create({
    data: {
      ...data,
      userId: client.userId,
      clientId,
      projectId: projectId ?? null,
    },
    include: { client: true, project: true },
  });

  return NextResponse.json(invoice, { status: 201 });
}
