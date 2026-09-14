import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { FlashToast, ToastProvider } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <ToastProvider>
          {children}
          {/* Reads the URL, so it needs a boundary on pages that are otherwise static. */}
          <Suspense fallback={null}>
            <FlashToast />
          </Suspense>
        </ToastProvider>
      </body>
    </html>
  );
}
