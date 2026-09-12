import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boardy · AI Onboarding Copilot",
  description: "Event-driven AI assistant that tracks new employee onboarding progress via metadata and delivers role-specific reports to HR and Managers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
