import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Strength Scaling CRM",
  description: "Internal SDR operating system for Strength Scaling"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
