import { SwapWidget } from '@/components/swap/SwapWidget'
import { ArrowRight, Zap, DollarSign, Globe } from 'lucide-react'
import Link from 'next/link'
import { TiltCard } from '@/components/ui/TiltCard'

export default function SwapPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">

        {/* Hero Content */}
        <div className="relative z-10 text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-full px-4 py-1.5 mb-4 md:mb-6 text-sm animate-float-shadow">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-[var(--success)] font-medium">Live on Arc Testnet</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">
            <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent animate-gradient-rotate" style={{ backgroundSize: '200% 200%' }}>
              Stablecoin SuperExchange
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] text-base md:text-lg max-w-xl mx-auto px-4">
            Swap stablecoins with minimal slippage, instant settlement, and predictable fees on Arc Network
          </p>
        </div>

        {/* Swap Widget with Tilt Effect */}
        <div className="w-full max-w-md">
          <TiltCard tiltAmount={5} glareEnabled={true}>
            <SwapWidget />
          </TiltCard>
        </div>

        {/* Stats with counting animation */}
        <div className="relative z-10 mt-8 md:mt-12 grid grid-cols-3 gap-4 md:gap-8 text-center stagger-fade">
          <TiltCard tiltAmount={8} className="px-4 py-3 rounded-xl glass-premium">
            <div className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
              <span className="bg-gradient-to-r from-[var(--success)] to-emerald-400 bg-clip-text text-transparent">$0.01</span>
            </div>
            <div className="text-xs md:text-sm text-[var(--text-secondary)]">Avg. Fee</div>
          </TiltCard>
          <TiltCard tiltAmount={8} className="px-4 py-3 rounded-xl glass-premium">
            <div className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">&lt;350ms</span>
            </div>
            <div className="text-xs md:text-sm text-[var(--text-secondary)]">Finality</div>
          </TiltCard>
          <TiltCard tiltAmount={8} className="px-4 py-3 rounded-xl glass-premium">
            <div className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">0.04%</span>
            </div>
            <div className="text-xs md:text-sm text-[var(--text-secondary)]">Swap Fee</div>
          </TiltCard>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-[var(--card-border)] py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-8 md:mb-12 text-[var(--text-primary)]">
            Why <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">XyloNet</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-4 md:gap-8 stagger-fade">
            <FeatureCard
              title="Instant Settlement"
              description="Sub-second deterministic finality powered by Arc's Malachite consensus. No waiting, no reorgs."
              icon={<Zap className="w-6 h-6" />}
              gradient="from-yellow-500 to-orange-500"
            />
            <FeatureCard
              title="Predictable Fees"
              description="Pay ~$0.01 per transaction in USDC. No volatile gas tokens, no fee spikes."
              icon={<DollarSign className="w-6 h-6" />}
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              title="Native Bridge"
              description="Bridge USDC across chains using Circle CCTP. No wrapped tokens, real native USDC."
              icon={<Globe className="w-6 h-6" />}
              gradient="from-blue-500 to-cyan-500"
            />
          </div>
          
          {/* Quick Links */}
          <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/pools" className="group flex items-center gap-2 glass-premium hover:border-[var(--primary)]/50 rounded-xl px-5 py-3 transition-all magnetic-hover">
              <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Provide Liquidity</span>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
            </Link>
            <Link href="/vault" className="group flex items-center gap-2 glass-premium hover:border-[var(--success)]/50 rounded-xl px-5 py-3 transition-all magnetic-hover">
              <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Earn Yield</span>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--success)] group-hover:translate-x-1 transition-all" />
            </Link>
            <Link href="/bridge" className="group flex items-center gap-2 glass-premium hover:border-[var(--secondary)]/50 rounded-xl px-5 py-3 transition-all magnetic-hover">
              <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Bridge USDC</span>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--secondary)] group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ title, description, icon, gradient }: { title: string; description: string; icon: React.ReactNode; gradient: string }) {
  return (
    <TiltCard tiltAmount={8} glareEnabled={true}>
      <div className="glass-premium rounded-2xl p-5 md:p-6 h-full holographic">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 text-white depth-shadow`}>
          {icon}
        </div>
        <h3 className="text-base md:text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
        <p className="text-[var(--text-secondary)] text-sm">{description}</p>
      </div>
    </TiltCard>
  )
}
