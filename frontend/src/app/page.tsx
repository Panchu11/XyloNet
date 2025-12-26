import { SwapWidget } from '@/components/swap/SwapWidget'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[var(--background)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-[var(--primary)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-[var(--secondary)]/10 rounded-full blur-3xl" style={{ animationDelay: '3s' }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 bg-[var(--card-border)] border border-[var(--card-border)] rounded-full px-4 py-1.5 mb-4 md:mb-6 text-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-[var(--text-secondary)]">Live on Arc Testnet</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">
            <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent">
              Stablecoin SuperExchange
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] text-base md:text-lg max-w-xl mx-auto px-4">
            Swap stablecoins with minimal slippage, instant settlement, and predictable fees on Arc Network
          </p>
        </div>

        {/* Swap Widget */}
        <div className="w-full max-w-md">
          <SwapWidget />
        </div>

        {/* Stats */}
        <div className="relative z-10 mt-8 md:mt-12 grid grid-cols-3 gap-4 md:gap-8 text-center">
          <div className="px-2">
            <div className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">$0.01</div>
            <div className="text-xs md:text-sm text-[var(--text-secondary)]">Avg. Fee</div>
          </div>
          <div className="px-2">
            <div className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">&lt;350ms</div>
            <div className="text-xs md:text-sm text-[var(--text-secondary)]">Finality</div>
          </div>
          <div className="px-2">
            <div className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">0.04%</div>
            <div className="text-xs md:text-sm text-[var(--text-secondary)]">Swap Fee</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-[var(--card-border)] bg-gradient-to-b from-transparent to-[var(--background)] py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-8 md:mb-12 text-[var(--text-primary)]">Why XyloNet?</h2>
          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            <FeatureCard
              title="Instant Settlement"
              description="Sub-second deterministic finality powered by Arc's Malachite consensus. No waiting, no reorgs."
              icon="⚡"
            />
            <FeatureCard
              title="Predictable Fees"
              description="Pay ~$0.01 per transaction in USDC. No volatile gas tokens, no fee spikes."
              icon="💰"
            />
            <FeatureCard
              title="Native Bridge"
              description="Bridge USDC across chains using Circle CCTP. No wrapped tokens, real native USDC."
              icon="🌉"
            />
          </div>
          
          {/* Quick Links */}
          <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/pools" className="group flex items-center gap-2 bg-[var(--card-border)] hover:bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-4 py-2 transition-all">
              <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Provide Liquidity</span>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all" />
            </Link>
            <Link href="/vault" className="group flex items-center gap-2 bg-[var(--card-border)] hover:bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-4 py-2 transition-all">
              <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Earn Yield</span>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all" />
            </Link>
            <Link href="/bridge" className="group flex items-center gap-2 bg-[var(--card-border)] hover:bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-4 py-2 transition-all">
              <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Bridge USDC</span>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-[var(--card-bg)] rounded-2xl p-5 md:p-6 border border-[var(--card-border)] hover:border-[var(--primary)]/50 hover:bg-[var(--card-border)] transition-all duration-300">
      <div className="text-2xl md:text-3xl mb-3 md:mb-4">{icon}</div>
      <h3 className="text-base md:text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-[var(--text-secondary)] text-sm">{description}</p>
    </div>
  )
}
