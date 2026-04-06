import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateInvoiceSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  vatRate: z.number().optional(),
  vatAmount: z.number().optional(),
  dueDate: z.string().transform((s) => new Date(s)).optional(),
  paidAt: z.string().transform((s) => new Date(s)).nullable().optional(),
  lineItems: z.array(z.object({
    description: z.string(),
    hours: z.number().optional(),
    rate: z.number().optional(),
    amount: z.number(),
  })).optional(),
  notes: z.string().nullable().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { client: true, project: true, paymentFollowUps: true },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json(invoice);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const parsed = updateInvoiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const invoice = await prisma.invoice.update({
    where: { id: params.id },
    data: parsed.data,
    include: { client: true, project: true },
  });

  return NextResponse.json(invoice);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.invoice.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
