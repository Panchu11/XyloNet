'use client';

import dynamic from 'next/dynamic';
import { Hero, Features } from '@/components/landing';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

// Performance: Lazy load below-the-fold components
const Campaign = dynamic(() => import('@/components/landing').then(mod => ({ default: mod.Campaign })), {
  loading: () => <div className="min-h-screen" />,
  ssr: false, // Campaign needs wallet connection - client only
});

const SupportedAssets = dynamic(() => import('@/components/landing').then(mod => ({ default: mod.SupportedAssets })), {
  loading: () => <div className="min-h-[400px]" />,
});

const PoweredByArc = dynamic(() => import('@/components/landing').then(mod => ({ default: mod.PoweredByArc })), {
  loading: () => <div className="min-h-[400px]" />,
});

const LandingFooter = dynamic(() => import('@/components/landing').then(mod => ({ default: mod.LandingFooter })), {
  loading: () => <div className="min-h-[300px]" />,
});

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
