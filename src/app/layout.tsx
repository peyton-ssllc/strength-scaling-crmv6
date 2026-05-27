import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Strength Scaling CRM",
  description: "Internal SDR operating system for Strength Scaling",
  icons: {
    icon: "/brand/strength-scaling-logo.png",
    shortcut: "/brand/strength-scaling-logo.png",
    apple: "/brand/strength-scaling-logo.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
