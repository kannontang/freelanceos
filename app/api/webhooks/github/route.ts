import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";

// GitHub webhook secret
const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || "";

function verifyGitHubSignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    // If no secret configured, skip verification (development)
    return true;
  }

  // GitHub sends signature as "sha256=..."
  const hash = createHmac("sha256", secret).update(body).digest("hex");
  const expectedSignature = `sha256=${hash}`;
  
  return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    const event = request.headers.get("x-github-event");

    // Verify signature
    if (!verifyGitHubSignature(body, signature, webhookSecret)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    const userId = payload.repository?.owner?.login || "github";

    switch (event) {
      case "push": {
        // Check for secrets/passwords in changed files
        const commits = payload.commits || [];
        const addedFiles = commits.flatMap((c: any) => c.added || []);
        
        // Check for potential secrets
        const suspiciousFiles = addedFiles.filter((file: string) => {
          const fileLower = file.toLowerCase();
          return (
            fileLower.includes("credential") ||
            fileLower.includes("secret") ||
            fileLower.includes("password") ||
            fileLower.includes(".env") ||
            fileLower.includes("api_key") ||
            fileLower.includes("private_key")
          );
        });

        if (suspiciousFiles.length > 0) {
          // Create a high-severity compliance alert
          await prisma.complianceAlert.create({
            data: {
              userId,
              title: "Potential secret pushed to repository",
              description: `Files potentially containing secrets were pushed: ${suspiciousFiles.join(", ")}`,
              region: "GitHub",
              regulation: "Security Best Practices",
              severity: "WARNING",
              dismissed: false,
            },
          });
          console.log("Created compliance alert for suspicious files:", suspiciousFiles);
        }

        console.log("Push event received:", payload.ref);
        break;
      }

      case "pull_request": {
        // Create a PR alert (informational)
        const pr = payload.pull_request;
        await prisma.complianceAlert.create({
          data: {
            userId,
            title: `Pull Request: ${pr?.title || "Untitled"}`,
            description: `PR #${pr?.number} - ${pr?.head?.ref} -> ${pr?.base?.ref}`,
            region: "GitHub",
            regulation: "Code Review",
            severity: "INFO",
            dismissed: false,
          },
        });
        console.log("PR event received:", pr?.title);
        break;
      }

      case "issues": {
        console.log("Issue event received:", payload.issue?.title);
        break;
      }

      default:
        console.log(`Unhandled GitHub event: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("GitHub webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}