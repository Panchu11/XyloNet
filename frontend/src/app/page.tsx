'use client';

import { Hero, Features, Campaign, SupportedAssets, PoweredByArc, LandingFooter } from '@/components/landing';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0f]">
      <AnimatedBackground />
      
      <main className="relative z-10">
        <Hero />
        <Features />
        <Campaign />
        <SupportedAssets />
        <PoweredByArc />
      </main>
      
      <LandingFooter />
    </div>
  );
}
