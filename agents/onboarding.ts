import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { onboardingClientEmail } from "@/emails/client-onboarding";

export class OnboardingAgent {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async sendOnboardingLink(clientId: string, projectId: string) {
    const [client, project] = await Promise.all([
      prisma.client.findUnique({ where: { id: clientId } }),
      prisma.project.findUnique({ where: { id: projectId } }),
    ]);

    if (!client || !project) throw new Error("Client or project not found");

    // Create onboarding form record
    const form = await prisma.onboardingForm.create({
      data: {
        clientId,
        fields: [
          { key: "projectBrief", label: "Project Brief / Goals", type: "textarea", required: true },
          { key: "targetDate", label: "Target Completion Date", type: "date", required: true },
          { key: "styleGuide", label: "Brand/Style Guide", type: "file", required: false },
          { key: "paymentInfo", label: "Billing Details", type: "textarea", required: true },
          { key: "communicationPref", label: "Communication Preference", type: "select", required: true, options: ["Email", "Slack", "Phone", "WhatsApp"] },
        ],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    const onboardingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/onboard/${form.token}`;

    // Send email to client
    const { data, error } = await resend.emails.send({
      from: "FreelanceOS <noreply@freelanceos.ai>",
      to: client.email,
      subject: `Welcome! Complete your project onboarding for ${project.name}`,
      html: onboardingClientEmail({
        clientName: client.name,
        projectName: project.name,
        onboardingUrl,
        freelancerName: "your freelancer", // Would be fetched from user
      }),
    });

    if (error) throw error;

    // Update project status to onboarding
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "ONBOARDING" },
    });

    // Log activity
    await prisma.agentActivity.create({
      data: {
        userId: this.userId,
        agentType: "ONBOARDING",
        action: `Sent onboarding link to ${client.name}`,
        status: "success",
        details: { clientId, projectId, formId: form.id, emailId: data?.id },
      },
    });

    return { success: true, formId: form.id, emailId: data?.id };
  }

  async checkOnboardingStatus(formId: string) {
    const form = await prisma.onboardingForm.findUnique({
      where: { id: formId },
      include: { client: true },
    });

    if (!form) throw new Error("Form not found");

    return {
      completed: form.completed,
      responses: form.responses,
      expiresAt: form.expiresAt,
      client: form.client.name,
    };
  }
}
