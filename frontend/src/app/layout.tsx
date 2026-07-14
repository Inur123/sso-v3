import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Mengimpor font Inter premium untuk tampilan modern dan bersih
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portal SSO Corporate",
  description: "Single Sign-On Secure Portal Identity Provider",
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="bottom-right" closeButton visibleToasts={1} />
      </body>
    </html>
  );
}
