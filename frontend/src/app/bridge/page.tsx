import { BridgeWidget } from '@/components/bridge/BridgeWidget'

export default function BridgePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[var(--background)]">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <div className="relative z-10 text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Cross-Chain Bridge
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
            Bridge USDC natively across chains using Circle CCTP. No wrapped tokens, instant finality on Arc.
          </p>
        </div>

        {/* Bridge Widget */}
        <BridgeWidget />

        {/* Info Cards */}
        <div className="relative z-10 mt-12 grid md:grid-cols-3 gap-6 max-w-4xl">
          <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--card-border)]">
            <div className="text-2xl mb-2">🔐</div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">Native USDC</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Real USDC minted by Circle, not wrapped or synthetic tokens
            </p>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--card-border)]">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">Fast Finality</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Sub-second finality on Arc Network after attestation
            </p>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--card-border)]">
            <div className="text-2xl mb-2">🌐</div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">Multi-Chain</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Bridge from Ethereum, Base, Arbitrum, Optimism, and more
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}