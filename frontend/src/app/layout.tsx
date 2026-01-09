import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AnimatedBackgroundWrapper } from "@/components/ui/AnimatedBackgroundWrapper";
import { CommandPalette } from "@/components/ui/CommandPalette";
import ConditionalFooter from "@/components/ConditionalFooter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap', // Performance: Prevent font loading blocking
  preload: true, // Performance: Preload font files
});

export const metadata: Metadata = {
  title: "XyloNet - Stablecoin SuperExchange on Arc",
  description: "The premier DEX + Bridge on Arc Network. Instant settlement, predictable fees, and native cross-chain transfers powered by Circle CCTP.",
  keywords: ["DEX", "Bridge", "Arc Network", "Stablecoin", "USDC", "EURC", "DeFi"],
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'XyloNet - Stablecoin SuperExchange on Arc',
    description: 'The premier DEX + Bridge on Arc Network. Swap, Bridge, and Earn with USDC, EURC, and USYC.',
    url: 'https://xylonet.xyz',
    siteName: 'XyloNet',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'XyloNet - Stablecoin SuperExchange on Arc',
    description: 'The premier DEX + Bridge on Arc Network.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[var(--background)] text-[var(--text-primary)] min-h-screen flex flex-col`}>
        <Providers>
          <AnimatedBackgroundWrapper />
          <CommandPalette />
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <ConditionalFooter />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
