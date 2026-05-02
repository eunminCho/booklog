import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";
import "./globals.css";
import { siteMetadata } from "@/src/lib/site-metadata";
import { AppProviders } from "@/src/providers/app-providers";
import { EmotionRegistry } from "@/src/providers/emotion-registry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable}`}
      data-theme="system"
      style={{ "--app-font-scale": 1 } as CSSProperties}
      suppressHydrationWarning
    >
      <body>
        <EmotionRegistry>
          <AppProviders>{children}</AppProviders>
        </EmotionRegistry>
      </body>
    </html>
  );
}
