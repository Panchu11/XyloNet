'use client'

export default function BridgePage() {
  return (
    <div className="prose prose-invert max-w-none">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Bridge</h1>
        <p className="text-xl text-gray-400">
          Bridge native USDC from Arc Network to other blockchains using Circle's Cross-Chain Transfer Protocol (CCTP) V2 with Fast Transfer.
        </p>
      </div>

      {/* What is CCTP */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">What is CCTP?</h2>
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
          <p className="text-gray-300 mb-4">
            <strong className="text-white">Cross-Chain Transfer Protocol (CCTP)</strong> is Circle's official protocol 
            for transferring native USDC between blockchains. Unlike traditional bridges that use wrapped tokens, 
            CCTP burns USDC on the source chain and mints native USDC on the destination chain.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-3xl mb-2">🔥</div>
              <h4 className="text-white font-semibold mb-1">Burn & Mint</h4>
              <p className="text-gray-400 text-sm">No wrapped tokens. Real USDC on every chain.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="text-white font-semibold mb-1">Circle Secured</h4>
              <p className="text-gray-400 text-sm">Backed by Circle's attestation service.</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="text-white font-semibold mb-1">Fast Transfer</h4>
              <p className="text-gray-400 text-sm">~30 seconds with CCTP V2 Fast Transfer mode.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Chains */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Supported Chains</h2>
        <p className="text-gray-300 mb-6">
          Bridge USDC to and from Arc Network via any of these supported chains:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'Ethereum', domain: 0, logo: '/chains/ethereum.svg', chainId: 1 },
            { name: 'Arbitrum', domain: 3, logo: '/chains/arbitrum.svg', chainId: 42161 },
            { name: 'Base', domain: 6, logo: '/chains/base.jpg', chainId: 8453 },
            { name: 'Optimism', domain: 2, logo: '/chains/optimism.svg', chainId: 10 },
            { name: 'Polygon', domain: 7, logo: '/chains/polygon.svg', chainId: 137 },
            { name: 'Arc Testnet', domain: 26, logo: '/chains/arc.png', chainId: 5042002 },
          ].map((chain) => (
            <div key={chain.name} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <img src={chain.logo} alt={chain.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-white font-semibold">{chain.name}</p>
                  <p className="text-xs text-gray-500">Domain: {chain.domain} | Chain ID: {chain.chainId}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How to Bridge */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">How to Bridge</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <ol className="space-y-6">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Connect Your Wallet</h4>
                <p className="text-gray-400 text-sm">Connect your wallet on Arc Network where you have USDC.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">2</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Select Destination Chain</h4>
                <p className="text-gray-400 text-sm">Choose where you want to send your USDC (e.g., Ethereum Sepolia).</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">3</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Enter Amount</h4>
                <p className="text-gray-400 text-sm">Enter the amount of USDC you want to bridge.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">4</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Click Bridge</h4>
                <p className="text-gray-400 text-sm">Confirm the transaction. Circle Bridge Kit handles approval, burn, attestation, and minting automatically.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">✓</span>
              <div>
                <h4 className="text-white font-semibold mb-1">Receive USDC (~30 seconds)</h4>
                <p className="text-gray-400 text-sm">Native USDC is automatically delivered to your wallet on the destination chain.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Bridge Flow Diagram */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Bridge Flow</h2>
        <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                <img src="/chains/arc.png" alt="Arc" className="w-8 h-8" />
              </div>
              <p className="text-white font-semibold">Arc Network</p>
              <p className="text-xs text-gray-500">Burn USDC</p>
            </div>
            <div className="hidden md:block flex-1 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🔐</span>
              </div>
              <p className="text-white font-semibold">Circle CCTP</p>
              <p className="text-xs text-gray-500">Fast Attestation</p>
            </div>
            <div className="hidden md:block flex-1 h-0.5 bg-gradient-to-r from-purple-500 to-green-500" />
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                <img src="/chains/ethereum.svg" alt="Destination" className="w-8 h-8" />
              </div>
              <p className="text-white font-semibold">Destination</p>
              <p className="text-xs text-gray-500">Mint USDC</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bridge Times */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Transfer Modes</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <h4 className="text-green-400 font-bold">Fast Transfer</h4>
                  <p className="text-xs text-gray-400">Currently Active</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-3">XyloNet uses Circle Bridge Kit with Fast Transfer mode for near-instant bridging.</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Transfer Time:</span><span className="text-green-400 font-semibold">~30 seconds</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Auto-Delivery:</span><span className="text-white">Yes (Circle Relayer)</span></div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-5 opacity-60">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                  <span className="text-xl">⏳</span>
                </div>
                <div>
                  <h4 className="text-gray-400 font-bold">Standard Transfer</h4>
                  <p className="text-xs text-gray-500">Not Used</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-3">Waits for full source chain finality before attestation.</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Transfer Time:</span><span className="text-gray-500">~15-19 minutes</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Use Case:</span><span className="text-gray-500">High-value transfers</span></div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-200 text-sm">
              <strong>ℹ️</strong> Fast Transfer uses Circle's over-collateralization pool to provide faster-than-finality settlement while maintaining full security guarantees.
            </p>
          </div>
        </div>
      </section>

      {/* Implementation Note */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Technical Implementation</h2>
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h3 className="text-white font-bold mb-2">Why We Use Circle Bridge Kit</h3>
              <p className="text-gray-300 text-sm mb-4">
                For the best user experience, XyloNet's frontend uses <strong className="text-white">Circle Bridge Kit</strong> directly 
                instead of our XyloBridge smart contract. This allows us to offer <strong className="text-green-400">Fast Transfer mode (~30 seconds)</strong> 
                with automatic delivery - Circle's relayer handles everything for you.
              </p>
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300 text-sm"><strong className="text-white">Circle Bridge Kit</strong> - Used by frontend for ~30 second transfers</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400 text-sm"><strong className="text-gray-300">XyloBridge Contract</strong> - Deployed but not used by frontend (Standard Transfer ~15-19 min)</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                The XyloBridge contract remains available for developers who want programmatic access or prefer Standard Transfer for high-value transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Contract */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Smart Contract</h2>
        <div className="bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h3 className="font-mono text-sm text-gray-400">XyloBridge</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contract Address</p>
              <a 
                href="https://testnet.arcscan.app/address/0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641" 
                target="_blank" 
                rel="noopener"
                className="text-blue-400 font-mono text-sm hover:text-blue-300 break-all"
              >
                0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641
              </a>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Circle Token Messenger</p>
              <span className="text-blue-400 font-mono text-sm break-all">
                0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Circle Message Transmitter</p>
              <span className="text-blue-400 font-mono text-sm break-all">
                0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Fees */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Fees</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-2">Bridge Fee</h4>
              <p className="text-3xl font-bold text-green-400">0%</p>
              <p className="text-gray-400 text-sm mt-2">XyloNet doesn't charge any bridge fees.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Gas (Source Chain)</h4>
              <p className="text-gray-300">Variable</p>
              <p className="text-gray-400 text-sm mt-2">Standard gas fees apply on the source chain.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Gas (Arc Network)</h4>
              <p className="text-gray-300">~$0.001</p>
              <p className="text-gray-400 text-sm mt-2">Minimal fees on Arc Network.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Bridge?</h3>
          <p className="text-gray-300 mb-6">Transfer USDC from any chain to Arc Network in minutes.</p>
          <a 
            href="/bridge" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Launch Bridge
          </a>
        </div>
      </section>
    </div>
  )
}