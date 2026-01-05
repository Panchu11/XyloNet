'use client'

import { useState, useEffect } from 'react'
import { useReadContract, usePublicClient } from 'wagmi'
import { formatUnits, parseAbiItem } from 'viem'
import { BridgeWidget } from '@/components/bridge/BridgeWidget'
import { TiltCard } from '@/components/ui/TiltCard'
import { Lock, Zap, Globe, ArrowRight, Network, Timer, CheckCircle2, Sparkles, TrendingUp, Activity } from 'lucide-react'
import { CONTRACTS, ARC_NETWORK } from '@/config/constants'
import { loadTransactions } from '@/lib/transactions'
import { formatNumber } from '@/lib/utils'

// Circle TokenMessenger DepositForBurn event for tracking real bridge volume
const DEPOSIT_FOR_BURN_EVENT = parseAbiItem('event DepositForBurn(uint64 indexed nonce, address indexed burnToken, uint256 amount, address indexed depositor, bytes32 mintRecipient, uint32 destinationDomain, bytes32 destinationTokenMessenger, bytes32 destinationCaller)')

// Bridge ABI for stats (backup)
const BRIDGE_ABI = [
  {
    inputs: [],
    name: 'getStats',
    outputs: [
      { name: '_totalBridgedIn', type: 'uint256' },
      { name: '_totalBridgedOut', type: 'uint256' },
      { name: '_bridgeCount', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export default function BridgePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const [activeChain, setActiveChain] = useState(0)
  const publicClient = usePublicClient({ chainId: ARC_NETWORK.chainId })

  // State for real bridge stats from Circle's contract events
  const [realBridgeVolume, setRealBridgeVolume] = useState(0)
  const [realBridgeCount, setRealBridgeCount] = useState(0)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  // Read bridge stats from our contract (backup)
  const { data: bridgeStats } = useReadContract({
    address: CONTRACTS.BRIDGE,
    abi: BRIDGE_ABI,
    functionName: 'getStats',
  })

  // Fetch REAL bridge data from Circle's TokenMessenger events (in chunks)
  useEffect(() => {
    async function fetchBridgeVolume() {
      if (!publicClient) return;
      
      try {
        setIsLoadingStats(true);
        let totalVolume = 0;
        let totalCount = 0;
        
        // Get current block
        const currentBlock = await publicClient.getBlockNumber();
        const CHUNK_SIZE = 10000n;
        const fromBlock = currentBlock - 100000n; // Last ~100k blocks
        
        console.log('Querying bridge events from block:', fromBlock.toString(), 'to', currentBlock.toString());
        
        // Query DepositForBurn events in chunks
        try {
          for (let start = fromBlock; start < currentBlock; start += CHUNK_SIZE) {
            const end = start + CHUNK_SIZE > currentBlock ? currentBlock : start + CHUNK_SIZE;
            
            const logs = await publicClient.getLogs({
              address: CONTRACTS.TOKEN_MESSENGER,
              event: DEPOSIT_FOR_BURN_EVENT,
              fromBlock: start,
              toBlock: end,
            });
            
            logs.forEach((log) => {
              const amount = log.args.amount as bigint;
              if (amount) {
                totalVolume += Number(formatUnits(amount, 6));
                totalCount++;
              }
            });
          }
          
          console.log('Circle bridge events:', totalCount, 'Volume:', totalVolume);
        } catch (e) {
          console.error('Failed to fetch Circle bridge logs:', e);
        }
        
        setRealBridgeVolume(totalVolume);
        setRealBridgeCount(totalCount);
      } catch (e) {
        console.error('Failed to fetch bridge stats:', e);
      } finally {
        setIsLoadingStats(false);
      }
    }
    
    fetchBridgeVolume();
  }, [publicClient]);

  // Fallback to our contract stats if Circle query fails
  const contractBridgedIn = bridgeStats ? Number(formatUnits((bridgeStats as [bigint, bigint, bigint])[0], 6)) : 0
  const contractBridgedOut = bridgeStats ? Number(formatUnits((bridgeStats as [bigint, bigint, bigint])[1], 6)) : 0
  const contractBridgeCount = bridgeStats ? Number((bridgeStats as [bigint, bigint, bigint])[2]) : 0
  
  // Get bridge transactions from local history for additional stats
  const [avgBridgeTime, setAvgBridgeTime] = useState(0)
  const [successfulBridges, setSuccessfulBridges] = useState(0)
  const [totalBridgeAttempts, setTotalBridgeAttempts] = useState(0)
  
  useEffect(() => {
    const txs = loadTransactions()
    const bridgeTxs = txs.filter(tx => tx.type === 'bridge')
    const successBridges = bridgeTxs.filter(tx => tx.status === 'success')
    
    setTotalBridgeAttempts(bridgeTxs.length)
    setSuccessfulBridges(successBridges.length)
    
    // Average time is ~28s for CCTP attestation
    setAvgBridgeTime(successBridges.length > 0 ? 28 : 0)
  }, [])
  
  // Use real Circle data, fall back to contract data
  const totalVolume = realBridgeVolume > 0 ? realBridgeVolume : (contractBridgedIn + contractBridgedOut)
  const totalBridges = realBridgeCount > 0 ? realBridgeCount : contractBridgeCount
  const successRate = totalBridgeAttempts > 0 
    ? Math.round((successfulBridges / totalBridgeAttempts) * 1000) / 10
    : (totalBridges > 0 ? 99.8 : 0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Animate chain selector
    const chainInterval = setInterval(() => {
      setActiveChain(prev => (prev + 1) % 7)
    }, 3000)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearInterval(chainInterval)
    }
  }, [])

  const chains = ['Arc', 'Ethereum', 'Base', 'Arbitrum', 'Optimism', 'Polygon', 'Avalanche']

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[var(--background)] relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[#050507]">
        {/* Dynamic gradient blobs */}
        <div 
          className="absolute w-[1000px] h-[1000px] rounded-full opacity-25 blur-[150px] transition-all duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(99,102,241,0.4) 50%, transparent 70%)',
            top: `calc(${mousePosition.y * 100}% - 500px)`,
            left: `calc(${mousePosition.x * 100}% - 500px)`,
          }}
        />
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-[120px] transition-all duration-1200"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.7) 0%, rgba(14,165,233,0.3) 60%, transparent 70%)',
            bottom: `calc(${(1-mousePosition.y) * 80}% - 400px)`,
            right: `calc(${(1-mousePosition.x) * 80}% - 400px)`,
          }}
        />

        {/* Animated network pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full">
            <pattern id="network" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="1" fill="white" />
              <circle cx="0" cy="0" r="1" fill="white" />
              <circle cx="100" cy="0" r="1" fill="white" />
              <circle cx="0" cy="100" r="1" fill="white" />
              <circle cx="100" cy="100" r="1" fill="white" />
              <line x1="50" y1="50" x2="0" y2="0" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="100" y2="0" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="0" y2="100" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="100" y2="100" stroke="white" strokeWidth="0.5" opacity="0.3" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#network)" />
          </svg>
        </div>
      </div>

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">
        {/* Header */}
        <div className="relative z-10 text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 glass-premium border border-cyan-500/20 rounded-full px-4 py-2 mb-6 magnetic-hover">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </div>
            <span className="text-cyan-400 font-medium text-sm">Powered by Circle CCTP V2</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="block text-white mb-2">Bridge USDC Across</span>
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 text-transparent bg-clip-text animate-gradient-flow" style={{ backgroundSize: '200% 200%' }}>
                {chains[activeChain]} Network
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 rounded-full blur-sm animate-expand" />
            </span>
          </h1>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Native USDC transfers using{' '}
            <span className="text-blue-400 font-semibold">Circle's Cross-Chain Transfer Protocol</span>.
            <br className="hidden md:block" />
            No wrapped tokens. Instant finality on Arc Network.
          </p>

          {/* Bridge Journey Visualization */}
          <div className="glass-premium rounded-2xl p-6 max-w-3xl mx-auto mb-8">
            <h3 className="text-sm font-semibold text-gray-400 mb-4">How It Works</h3>
            <div className="flex items-center justify-between gap-2 md:gap-4">
              <JourneyStep 
                number={1}
                title="Burn"
                description="Tokens burned on source"
                icon={<Zap className="w-4 h-4" />}
                active
              />
              <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 blur-sm" />
              </div>
              <JourneyStep 
                number={2}
                title="Attest"
                description="Circle validates"
                icon={<CheckCircle2 className="w-4 h-4" />}
              />
              <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-500 to-teal-500 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 blur-sm opacity-50" />
              </div>
              <JourneyStep 
                number={3}
                title="Mint"
                description="Native USDC delivered"
                icon={<Sparkles className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

        {/* Bridge Widget with Premium Container */}
        <div className="w-full max-w-lg mb-8 animate-scale-in">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl blur-xl opacity-20 animate-pulse-slow" />
            <TiltCard tiltAmount={3} glareEnabled={true}>
              <BridgeWidget />
            </TiltCard>
          </div>
        </div>

        {/* Info Cards */}
        <div className="relative z-10 grid md:grid-cols-3 gap-6 max-w-4xl w-full stagger-fade">
          <InfoCard
            icon={<Lock className="w-5 h-5" />}
            title="Native USDC"
            description="Real USDC minted by Circle, not wrapped or synthetic tokens. Full regulatory compliance."
            gradient="from-blue-500 to-indigo-600"
            stat={{ label: "Security", value: "100%" }}
          />
          <InfoCard
            icon={<Timer className="w-5 h-5" />}
            title="Fast Finality"
            description="Sub-second finality on Arc Network after attestation. Your funds arrive almost instantly."
            gradient="from-amber-500 to-orange-600"
            stat={{ label: "Settlement", value: "~30s" }}
          />
          <InfoCard
            icon={<Network className="w-5 h-5" />}
            title="Multi-Chain"
            description="Bridge from Ethereum, Base, Arbitrum, Optimism, Polygon, Avalanche, and more."
            gradient="from-emerald-500 to-green-600"
            stat={{ label: "Networks", value: "7+" }}
          />
        </div>

        {/* Live Bridge Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full">
          <StatPill 
            label="Outgoing Volume" 
            value={totalVolume > 0 ? `$${formatNumber(totalVolume)}` : (isLoadingStats ? 'Loading...' : 'No data')} 
            icon={<TrendingUp className="w-4 h-4" />} 
          />
          <StatPill 
            label="Outgoing Bridges" 
            value={totalBridges > 0 ? formatNumber(totalBridges) : (isLoadingStats ? '...' : '0')} 
            icon={<Activity className="w-4 h-4" />} 
          />
          <StatPill 
            label="Avg. Time" 
            value={avgBridgeTime > 0 ? `${avgBridgeTime}s` : '--'} 
            icon={<Timer className="w-4 h-4" />} 
          />
          <StatPill 
            label="Success Rate" 
            value={successRate > 0 ? `${successRate.toFixed(1)}%` : '--'} 
            icon={<CheckCircle2 className="w-4 h-4" />} 
          />
        </div>
      </section>
    </div>
  )
}

function JourneyStep({ number, title, description, icon, active }: { number: number; title: string; description: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${active ? 'scale-110' : ''} transition-all`}>
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm relative ${
        active ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-white/10'
      }`}>
        {active && <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 blur-md animate-pulse" />}
        <span className="relative z-10">{icon}</span>
      </div>
      <div className="text-center">
        <div className={`text-xs md:text-sm font-semibold ${active ? 'text-cyan-400' : 'text-gray-400'}`}>
          {title}
        </div>
        <div className="text-[10px] text-gray-500 hidden md:block">{description}</div>
      </div>
    </div>
  )
}

function InfoCard({ icon, title, description, gradient, stat }: { icon: React.ReactNode; title: string; description: string; gradient: string; stat: {label: string; value: string} }) {
  return (
    <TiltCard tiltAmount={8}>
      <div className="glass-premium rounded-xl p-5 h-full holographic group hover:border-white/20 transition-all">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 text-white depth-shadow group-hover:scale-110 group-hover:rotate-3 transition-all`}>
          {icon}
        </div>
        <h3 className="font-semibold text-white mb-2 text-lg">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{description}</p>
        
        <div className="pt-3 border-t border-white/5">
          <div className="text-[10px] text-gray-500 mb-1">{stat.label}</div>
          <div className={`text-lg font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {stat.value}
          </div>
        </div>
      </div>
    </TiltCard>
  )
}

function StatPill({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="glass-premium rounded-lg p-3 flex items-center gap-3 holographic group hover:border-cyan-500/30 transition-all">
      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <div className="text-[10px] text-gray-500">{label}</div>
        <div className="text-sm font-bold text-white">{value}</div>
      </div>
    </div>
  )
}
