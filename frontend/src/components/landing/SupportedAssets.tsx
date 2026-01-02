'use client';

import { useEffect, useRef, useState } from 'react';

const tokens = [
  {
    name: 'USDC',
    fullName: 'USD Coin',
    color: '#2775CA',
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
  },
  {
    name: 'EURC',
    fullName: 'Euro Coin',
    color: '#2775CA',
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
  },
  {
    name: 'USYC',
    fullName: 'US Yield Coin',
    color: '#10B981',
    icon: null,
  },
];

const chains = [
  { name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg', color: '#627EEA' },
  { name: 'Arbitrum', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg', color: '#28A0F0' },
  { name: 'Base', icon: 'https://raw.githubusercontent.com/base-org/brand-kit/main/logo/in-product/Base_Network_Logo.svg', color: '#0052FF' },
  { name: 'Optimism', icon: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg', color: '#FF0420' },
  { name: 'Polygon', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.svg', color: '#8247E5' },
  { name: 'Avalanche', icon: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg', color: '#E84142' },
  { name: 'Arc', icon: null, color: '#3B82F6' },
];

function TokenCard({ token, index }: { token: typeof tokens[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`absolute -inset-0.5 rounded-2xl blur opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-50' : ''}`}
        style={{ backgroundColor: token.color }}
      />
      <div className="relative bg-[#0d0e12] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 text-center">
        <div 
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: `${token.color}20` }}
        >
          {token.icon ? (
            <img src={token.icon} alt={token.name} className="w-10 h-10" />
          ) : (
            <span className="text-2xl font-bold" style={{ color: token.color }}>{token.name.slice(0, 2)}</span>
          )}
        </div>
        <h4 className="text-xl font-bold text-white mb-1">{token.name}</h4>
        <p className="text-sm text-gray-400">{token.fullName}</p>
      </div>
    </div>
  );
}

function ChainBadge({ chain, index }: { chain: typeof chains[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`absolute -inset-0.5 rounded-xl blur-sm opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-50' : ''}`}
        style={{ backgroundColor: chain.color }}
      />
      <div className="relative flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:border-white/20 transition-all duration-300">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${chain.color}20` }}
        >
          {chain.icon ? (
            <img src={chain.icon} alt={chain.name} className="w-5 h-5" />
          ) : (
            <span className="text-sm font-bold" style={{ color: chain.color }}>A</span>
          )}
        </div>
        <span className="text-white font-medium">{chain.name}</span>
      </div>
    </div>
  );
}

export default function SupportedAssets() {
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
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Tokens section */}
        <div 
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-sm font-medium">Supported Assets</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Trade Your Favorite{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              Stablecoins
            </span>
          </h2>
        </div>

        {/* Token cards */}
        <div 
          className={`grid grid-cols-2 md:grid-cols-3 gap-6 mb-20 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {tokens.map((token, index) => (
            <TokenCard key={token.name} token={token} index={index} />
          ))}
        </div>

        {/* Chains section */}
        <div 
          className={`text-center mb-12 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Bridge Across{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              7+ Chains
            </span>
          </h3>
          <p className="text-gray-400 max-w-xl mx-auto">
            Move USDC seamlessly between networks using Circle&apos;s native CCTP protocol. No wrapped tokens, no liquidity pools.
          </p>
        </div>

        {/* Chain badges */}
        <div 
          className={`flex flex-wrap justify-center gap-4 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {chains.map((chain, index) => (
            <ChainBadge key={chain.name} chain={chain} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
