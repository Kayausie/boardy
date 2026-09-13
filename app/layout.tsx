import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Boardy · AI Onboarding Copilot",
  description: "Event-driven AI assistant that tracks new employee onboarding progress via metadata and delivers role-specific reports to HR and Managers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${jakarta.variable}`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
