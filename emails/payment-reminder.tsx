import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PaymentReminderEmailProps {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  status?: "overdue" | "pending";
}

export default function PaymentReminderEmail({
  clientName = "Client",
  invoiceNumber = "INV-0001",
  amount = "$1,000",
  dueDate = "April 15, 2026",
  status = "pending",
}: PaymentReminderEmailProps) {
  const isOverdue = status === "overdue";

  return (
    <Html>
      <Head />
      <Preview>
        {isOverdue
          ? `Invoice ${invoiceNumber} is overdue`
          : `Reminder: Invoice ${invoiceNumber} is due ${dueDate}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerText}>
              {isOverdue ? "Invoice Overdue" : "Invoice Reminder"}
            </Heading>
            <Text style={headerSubtext}>FreelanceOS</Text>
          </Section>

          <Section style={body}>
            <Text style={paragraph}>Hi {clientName},</Text>
            <Text style={paragraph}>
              Just a friendly reminder that invoice <strong>#{invoiceNumber}</strong> for{" "}
              <strong>{amount}</strong> is {isOverdue ? "overdue" : "pending"} since{" "}
              <strong>{dueDate}</strong>.
            </Text>

            <Section style={invoiceBox}>
              <Text style={invoiceLabel}>Invoice</Text>
              <Text style={invoiceValue}>#{invoiceNumber}</Text>
              <Text style={invoiceLabel}>Amount</Text>
              <Text style={invoiceValue}>{amount}</Text>
              <Text style={invoiceLabel}>Due Date</Text>
              <Text style={invoiceValue}>{dueDate}</Text>
              <Text style={invoiceLabel}>Status</Text>
              <Text style={{ ...invoiceValue, color: isOverdue ? "#ef4444" : "#eab308" }}>
                {isOverdue ? "Overdue" : "Pending"}
              </Text>
            </Section>

            <Section style={ctaSection}>
              <Button style={ctaButton} href="#">
                Pay Now
              </Button>
            </Section>

            <Text style={paragraph}>
              If you&apos;ve already made this payment, please disregard this email.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Sent by FreelanceOS &mdash; your freelance admin
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  padding: "40px 0",
};

const container = {
  backgroundColor: "#18181b",
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "600px",
  overflow: "hidden" as const,
};

const header = {
  backgroundColor: "#09090b",
  padding: "32px",
  textAlign: "center" as const,
};

const headerText = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 4px",
};

const headerSubtext = {
  color: "#71717a",
  fontSize: "14px",
  margin: "0",
};

const body = {
  padding: "32px",
};

const paragraph = {
  color: "#e4e4e7",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const invoiceBox = {
  backgroundColor: "#09090b",
  borderRadius: "6px",
  border: "1px solid #27272a",
  padding: "20px",
  margin: "24px 0",
};

const invoiceLabel = {
  color: "#71717a",
  fontSize: "12px",
  fontWeight: "600" as const,
  letterSpacing: "0.05em",
  margin: "0 0 2px",
  textTransform: "uppercase" as const,
};

const invoiceValue = {
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600" as const,
  margin: "0 0 12px",
};

const ctaSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const ctaButton = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "600",
  padding: "14px 32px",
  textDecoration: "none",
};

const hr = {
  borderColor: "#27272a",
  margin: "0",
};

const footer = {
  padding: "24px 32px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#52525b",
  fontSize: "12px",
  margin: "0",
};
