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
    <section ref={sectionRef} className="relative py-16 md:py-24 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-blue-500/10 rounded-full blur-[100px] md:blur-[120px]" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div 
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Main card */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-2xl md:rounded-3xl blur opacity-20" />
            <div className="relative bg-gradient-to-br from-[#0d0e12] to-[#0a0b0f] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-12">
              <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
                {/* Left side - Arc logo and info */}
                <div className="flex-1 text-center lg:text-left w-full">
                  <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-4 md:mb-6">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-blue-400 text-sm font-medium">Powered By</span>
                  </div>
                  
                  {/* Arc logo representation */}
                  <a href="https://www.arc.network/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center lg:justify-start gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <img src="/chains/arc.png" alt="Arc Network" className="w-9 md:w-12 h-9 md:h-12 object-contain" />
                    </div>
                    <div>
                      <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">Arc Network</h3>
                      <p className="text-sm md:text-base text-gray-400">By Circle</p>
                    </div>
                  </a>
                  
                  <p className="text-sm md:text-base lg:text-lg text-gray-400 mb-6 md:mb-8 max-w-lg mx-auto lg:mx-0">
                    Arc is Circle&apos;s Layer 1 blockchain purpose-built for stablecoin applications. 
                    It combines the security of traditional finance with the innovation of DeFi.
                  </p>
                  
                  <a
                    href="https://www.arc.network/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-white/10 border border-white/20 rounded-lg md:rounded-xl font-medium text-sm md:text-base text-white hover:bg-white/20 transition-all duration-300"
                  >
                    Learn More About Arc
                    <svg className="w-3.5 md:w-4 h-3.5 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {/* Right side - Features grid */}
                <div className="flex-1 grid grid-cols-2 gap-3 md:gap-4 w-full">
                  {arcFeatures.map((feature, index) => (
                    <div 
                      key={feature.title}
                      className={`bg-white/5 border border-white/10 rounded-lg md:rounded-xl p-3 md:p-4 hover:border-white/20 transition-all duration-300 ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      }`}
                      style={{ transitionDelay: `${index * 100 + 300}ms` }}
                    >
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 md:mb-3">
                        {feature.icon}
                      </div>
                      <h4 className="text-sm md:text-base font-semibold text-white mb-1">{feature.title}</h4>
                      <p className="text-xs md:text-sm text-gray-400">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Circle badge */}
        <div 
          className={`mt-8 md:mt-12 text-center transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="text-gray-500 text-xs md:text-sm flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 md:w-5 h-4 md:h-5" fill="currentColor">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            Built on Circle&apos;s trusted infrastructure
          </p>
        </div>
      </div>
    </section>
  );
}
