import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FreelanceOS — Autonomous AI Agent for Freelancers",
  description: "Your freelancer admin runs itself. AI agents handle invoicing, client follow-ups, and compliance 24/7.",
};

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

function isRealClerkKey(key: string) {
  return key.startsWith("pk_") && !key.includes("placeholder");
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {isRealClerkKey(publishableKey) ? (
          <ClerkProvider>
            {children}
          </ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
