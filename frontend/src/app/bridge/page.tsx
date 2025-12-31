import { BridgeWidget } from '@/components/bridge/BridgeWidget'
import { TiltCard } from '@/components/ui/TiltCard'
import { Lock, Zap, Globe } from 'lucide-react'

export default function BridgePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[var(--background)]">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Header */}
        <div className="relative z-10 text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent animate-gradient-rotate" style={{ backgroundSize: '200% 200%' }}>
              Cross-Chain Bridge
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
            Bridge USDC natively across chains using Circle CCTP. No wrapped tokens, instant finality on Arc.
          </p>
        </div>

        {/* Bridge Widget with Tilt Effect */}
        <TiltCard tiltAmount={5} glareEnabled={true}>
          <BridgeWidget />
        </TiltCard>

        {/* Info Cards */}
        <div className="relative z-10 mt-12 grid md:grid-cols-3 gap-6 max-w-4xl stagger-fade">
          <TiltCard tiltAmount={8}>
            <div className="glass-premium rounded-xl p-4 h-full holographic">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 depth-shadow">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Native USDC</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Real USDC minted by Circle, not wrapped or synthetic tokens
              </p>
            </div>
          </TiltCard>
          <TiltCard tiltAmount={8}>
            <div className="glass-premium rounded-xl p-4 h-full holographic">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 depth-shadow">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Fast Finality</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Sub-second finality on Arc Network after attestation
              </p>
            </div>
          </TiltCard>
          <TiltCard tiltAmount={8}>
            <div className="glass-premium rounded-xl p-4 h-full holographic">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-3 depth-shadow">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Multi-Chain</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Bridge from Ethereum, Base, Arbitrum, Optimism, and more
              </p>
            </div>
          </TiltCard>
        </div>
      </section>
    </div>
  )
}