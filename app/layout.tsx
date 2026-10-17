import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Morning Paper",
  description: "A daily newspaper edition written for one reader: you.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
