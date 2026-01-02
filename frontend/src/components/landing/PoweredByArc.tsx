'use client';

import { useEffect, useRef, useState } from 'react';

const arcFeatures = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Sub-Second Finality',
    description: '<350ms deterministic settlement',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Native USDC Gas',
    description: 'Pay fees directly in USDC',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 2L4 7l8 5 8-5-8-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 12l8 5 8-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 17l8 5 8-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Circle CCTP V2',
    description: 'Native cross-chain USDC',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 3l9 4.5v7c0 4-4 7-9 9-5-2-9-5-9-9v-7L12 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Enterprise Security',
    description: 'Institutional-grade infrastructure',
  },
];

export default function PoweredByArc() {
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
    <section ref={sectionRef} className="relative py-24 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div 
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Main card */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-3xl blur opacity-20" />
            <div className="relative bg-gradient-to-br from-[#0d0e12] to-[#0a0b0f] border border-white/10 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                {/* Left side - Arc logo and info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-blue-400 text-sm font-medium">Powered By</span>
                  </div>
                  
                  {/* Arc logo representation */}
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <svg viewBox="0 0 40 40" className="w-10 h-10 text-white">
                        <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="3" fill="none"/>
                        <path d="M12 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                        <circle cx="20" cy="20" r="4" fill="currentColor"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-4xl md:text-5xl font-bold text-white">Arc Network</h3>
                      <p className="text-gray-400">By Circle</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-lg mb-8 max-w-lg">
                    Arc is Circle&apos;s Layer 1 blockchain purpose-built for stablecoin applications. 
                    It combines the security of traditional finance with the innovation of DeFi.
                  </p>
                  
                  <a
                    href="https://www.circle.com/arc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-medium text-white hover:bg-white/20 transition-all duration-300"
                  >
                    Learn More About Arc
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {/* Right side - Features grid */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  {arcFeatures.map((feature, index) => (
                    <div 
                      key={feature.title}
                      className={`bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all duration-300 ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      }`}
                      style={{ transitionDelay: `${index * 100 + 300}ms` }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                        {feature.icon}
                      </div>
                      <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-400">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Circle badge */}
        <div 
          className={`mt-12 text-center transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            Built on Circle&apos;s trusted infrastructure
          </p>
        </div>
      </div>
    </section>
  );
}
