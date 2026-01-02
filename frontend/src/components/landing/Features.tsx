'use client';

import { useEffect, useRef, useState } from 'react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const features: Feature[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'StableSwap AMM',
    description: 'Trade stablecoins with near-zero slippage using Curve\'s proven invariant algorithm. Optimized for USDC, EURC, and USYC pairs.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M4 12h4m12 0h-4m-4-8v4m0 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 8l-2-2m12 12l-2-2m0-8l2-2m-12 12l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Cross-Chain Bridge',
    description: 'Transfer USDC across 7+ chains with Circle CCTP V2. Fast, secure, and native - no wrapped tokens or liquidity pools.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M4 9h16M9 4v16" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 13l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Yield Vault',
    description: 'Earn yield on your stablecoins with ERC-4626 compliant vaults. Auto-compounding strategies powered by USYC.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Lightning Fast',
    description: 'Sub-350ms transaction finality on Arc Network. No more waiting or uncertainty - trades settle instantly.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M9 16l-2 2m8-2l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Ultra Low Fees',
    description: 'Pay ~$0.01 per transaction using native USDC for gas. No ETH required, no bridging needed.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M12 3l9 4.5v7c0 4-4 7-9 9-5-2-9-5-9-9v-7L12 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Battle-Tested Security',
    description: 'Built on Circle\'s trusted infrastructure with audited smart contracts. Your funds are always safe.',
    gradient: 'from-rose-500 to-red-500',
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative group transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div 
        className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 blur-lg transition-opacity duration-300 ${
          isHovered ? 'opacity-50' : ''
        }`}
      />
      
      {/* Card content */}
      <div className="relative h-full bg-[#0d0e12] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} p-3 text-white mb-4 shadow-lg`}>
          {feature.icon}
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
        
        {/* Description */}
        <p className="text-gray-400 leading-relaxed">{feature.description}</p>
        
        {/* Hover arrow */}
        <div className={`absolute bottom-6 right-6 opacity-0 transform translate-x-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : ''}`}>
          <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Features() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div 
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-blue-400 text-sm font-medium">Why XyloNet?</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need for{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
              Stablecoins
            </span>
          </h2>
          
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The complete DeFi hub for stablecoin trading, bridging, and earning — all on Arc Network.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
