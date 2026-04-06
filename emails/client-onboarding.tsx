interface OnboardingEmailProps {
  clientName: string;
  projectName: string;
  onboardingUrl: string;
  freelancerName: string;
}

export function onboardingClientEmail({
  clientName,
  projectName,
  onboardingUrl,
  freelancerName,
}: OnboardingEmailProps) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; }
    .footer { margin-top: 40px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Hi ${clientName},</h2>
    <p>Thanks for starting a project with us! To get started on <strong>${projectName}</strong>, please complete the onboarding form. This helps ${freelancerName} understand your goals and preferences.</p>
    <p style="margin: 30px 0;">
      <a href="${onboardingUrl}" class="button">Complete Onboarding →</a>
    </p>
    <p>The form takes about 5 minutes and covers:</p>
    <ul>
      <li>Project goals and success criteria</li>
      <li>Your brand guidelines and style preferences</li>
      <li>Communication preferences</li>
      <li>Billing details for invoicing</li>
    </ul>
    <p>This link expires in 7 days. If you have any questions, just reply to this email.</p>
    <div class="footer">
      <p>Sent by FreelanceOS on behalf of ${freelancerName}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
