import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boardy · AI Onboarding Copilot",
  description: "Event-driven AI assistant that tracks new employee onboarding progress via metadata and delivers role-specific reports to HR and Managers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
