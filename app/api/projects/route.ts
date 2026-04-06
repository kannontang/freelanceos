import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProjectSchema = z.object({
  userId: z.string(),
  clientId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["ONBOARDING", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).default("ACTIVE"),
  hourlyRate: z.number().positive().optional(),
  budget: z.number().positive().optional(),
  githubRepo: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      client: true,
      invoices: { select: { id: true, amount: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: parsed.data,
    include: { client: true },
  });

  return NextResponse.json(project, { status: 201 });
}
