import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "서머너즈워 공속 계산기",
  description: "공속 계산기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="flex min-h-full flex-col font-sans antialiased text-[var(--sw-text)]">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
