'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useBalance, useConnectorClient } from 'wagmi'
import { ArrowRight, ChevronDown, Loader2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import { BridgeKit } from '@circle-fin/bridge-kit'
import { createAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import { TOKENS } from '@/config/constants'
import { cn, formatNumber } from '@/lib/utils'
import { useTxToast } from '@/components/ui/Toast'
import { ChainLogo } from '@/components/ui/TokenLogos'
import { Confetti } from '@/components/ui/Confetti'
import { StepIndicator } from '@/components/ui/EmptyState'

// Bridge Kit supported chains for Arc Testnet
const BRIDGE_CHAINS = [
  { id: 'Arc_Testnet', name: 'Arc Testnet', chainId: 5042002 },
  { id: 'Ethereum_Sepolia', name: 'Ethereum Sepolia', chainId: 11155111 },
  { id: 'Arbitrum_Sepolia', name: 'Arbitrum Sepolia', chainId: 421614 },
  { id: 'Base_Sepolia', name: 'Base Sepolia', chainId: 84532 },
  { id: 'Optimism_Sepolia', name: 'Optimism Sepolia', chainId: 11155420 },
  { id: 'Polygon_Amoy', name: 'Polygon Amoy', chainId: 80002 },
  { id: 'Avalanche_Fuji', name: 'Avalanche Fuji', chainId: 43113 },
]

type BridgeChain = typeof BRIDGE_CHAINS[number]

interface BridgeStep {
  name: string
  state: 'pending' | 'in_progress' | 'success' | 'error'
  txHash?: string
  explorerUrl?: string
}

export function BridgeWidget() {
  const { address, isConnected } = useAccount()
  const { data: client } = useConnectorClient()
  const { pending, success, error: errorToast } = useTxToast()
  
  const [sourceChain] = useState<BridgeChain>(BRIDGE_CHAINS[0]) // Arc Testnet as source (fixed)
  const [destChain, setDestChain] = useState<BridgeChain>(BRIDGE_CHAINS[3]) // Base Sepolia as default
  const [amount, setAmount] = useState('')
  const [showDestSelect, setShowDestSelect] = useState(false)
  const [isBridging, setIsBridging] = useState(false)
  const [bridgeResult, setBridgeResult] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [steps, setSteps] = useState<BridgeStep[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  // User USDC balance
  const { data: usdcBalance } = useBalance({ address, token: TOKENS.USDC.address })

  // Create Bridge Kit adapter from wagmi client
  const createAdapter = useCallback(async () => {
    if (!client?.transport) return null
    try {
      const provider = (client.transport as any)?.value?.provider || client.transport
      const adapter = await createAdapterFromProvider({ provider })
      return adapter
    } catch (err) {
      console.error('Failed to create adapter:', err)
      return null
    }
  }, [client])

  const handleBridge = async () => {
    if (!isConnected || !amount || !address) return
    
    setIsBridging(true)
    setErrorMsg(null)
    setBridgeResult(null)
    setSteps([
      { name: 'approve', state: 'pending' },
      { name: 'burn', state: 'pending' },
      { name: 'fetchAttestation', state: 'pending' },
      { name: 'mint', state: 'pending' },
    ])

    const toastId = pending('Bridging USDC...', `${amount} USDC to ${destChain.name}`)

    try {
      const adapter = await createAdapter()
      if (!adapter) {
        throw new Error('Failed to create wallet adapter')
      }

      const kit = new BridgeKit()
      
      // Listen to bridge events
      kit.on('*', (event: any) => {
        console.log(`[Bridge Event] ${event.method}:`, event.values)
        setCurrentStep(event.method)
        
        // Update step status
        setSteps(prev => prev.map(step => {
          if (step.name === event.method) {
            return {
              ...step,
              state: 'in_progress',
              txHash: event.values?.txHash,
              explorerUrl: event.values?.explorerUrl,
            }
          }
          return step
        }))
      })

      // Execute the bridge
      // Use recipientAddress instead of adapter for destination
      // This way Circle's relayer handles the mint, user doesn't need destination chain gas
      const result = await kit.bridge({
        from: { adapter, chain: sourceChain.id as any },
        to: { 
          adapter, // Still need adapter for address resolution
          chain: destChain.id as any,
          recipientAddress: address, // Explicitly set recipient
        },
        amount: amount,
        config: { 
          transferSpeed: 'FAST', // Fast transfer - Circle relayer handles mint
        },
      })

      console.log('Bridge result:', result)
      console.log('Bridge result state:', result.state)
      console.log('Bridge result steps:', result.steps)
      setBridgeResult(result)

      // Update all steps based on result
      if (result.steps) {
        setSteps(result.steps.map((s: any) => ({
          name: s.name,
          state: s.state,
          txHash: s.txHash,
          explorerUrl: s.explorerUrl,
        })))
      }

      // Check result state
      if (result.state === 'success') {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 100)
        success(toastId, 'Bridge Complete!', result.steps?.[result.steps.length - 1]?.txHash)
        setAmount('')
      } else if (result.state === 'error') {
        // Get error details from failed step
        const failedStep = result.steps?.find((s: any) => s.state === 'error') as any
        const resultAny = result as any
        const errorMessage = failedStep?.error?.message || resultAny?.error?.message || 'Bridge failed at step: ' + (failedStep?.name || 'unknown')
        throw new Error(errorMessage)
      } else {
        // Partial success or pending - show what happened
        console.log('Bridge ended with state:', result.state)
        throw new Error(`Bridge ended with state: ${result.state}`)
      }

    } catch (err: any) {
      console.error('Bridge error:', err)
      setErrorMsg(err.message || 'Bridge failed. Please try again.')
      errorToast(toastId, 'Bridge Failed', err.message || 'Transaction failed')
      
      // Mark current step as error
      setSteps(prev => prev.map(step => 
        step.state === 'in_progress' ? { ...step, state: 'error' } : step
      ))
    } finally {
      setIsBridging(false)
      setCurrentStep('')
    }
  }

  const estimatedTime = '~30 seconds (fast transfer)'
  const bridgeFee = amount ? `~${(parseFloat(amount) * 0.001).toFixed(4)} USDC` : '~0.1%'

  return (
    <div className="w-full max-w-lg mx-auto px-2 sm:px-0">
      {/* Confetti celebration */}
      <Confetti isActive={showConfetti} />
      
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-4 sm:p-6 card-lift">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">Bridge USDC</h2>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
            <span>Powered by</span>
            <span className="font-semibold text-[var(--text-primary)]">Circle Bridge Kit</span>
          </div>
        </div>

        {/* Success State */}
        {bridgeResult?.state === 'success' && (
          <div className="mb-4 p-4 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-[var(--success)]" />
              <div className="flex-1">
                <p className="font-medium text-[var(--success)]">Bridge Complete!</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Your USDC has been delivered to {destChain.name}
                </p>
              </div>
            </div>
            {/* Show step details */}
            <div className="mt-3 space-y-2">
              {steps.filter(s => s.txHash).map((step, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] capitalize">{step.name}</span>
                  {step.explorerUrl && (
                    <a
                      href={step.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] hover:underline flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {errorMsg && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div className="flex-1">
                <p className="font-medium text-red-400">Bridge Failed</p>
                <p className="text-sm text-[var(--text-secondary)]">{errorMsg}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bridge Progress */}
        {isBridging && (
          <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-blue-200 font-medium">Bridging in progress...</span>
            </div>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {step.state === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : step.state === 'in_progress' ? (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  ) : step.state === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-500" />
                  )}
                  <span className={cn(
                    'capitalize',
                    step.state === 'success' ? 'text-green-400' :
                    step.state === 'in_progress' ? 'text-blue-400' :
                    step.state === 'error' ? 'text-red-400' :
                    'text-gray-500'
                  )}>
                    {step.name === 'fetchAttestation' ? 'Fetch Attestation' : step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source Chain */}
        <div className="bg-[var(--card-border)] rounded-lg p-3 sm:p-4 mb-2">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm text-[var(--text-secondary)]">From</span>
            <button
              onClick={() => setAmount(usdcBalance?.formatted ?? '0')}
              className="text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] truncate"
            >
              Balance: {formatNumber(usdcBalance?.formatted ?? '0', 2)} USDC
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 bg-[var(--card-bg)] rounded-lg px-3 py-2 flex-shrink-0">
              <ChainLogo name={sourceChain.name} size={24} className="sm:w-7 sm:h-7" />
              <span className="font-medium text-[var(--text-primary)] text-sm whitespace-nowrap">{sourceChain.name}</span>
            </div>
            <div className="flex-1 flex items-center gap-2 min-w-0 bg-[var(--card-bg)] sm:bg-transparent rounded-lg px-3 py-2 sm:p-0">
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setBridgeResult(null); setErrorMsg(null); }}
                placeholder="0.00"
                disabled={isBridging}
                className="flex-1 min-w-0 bg-transparent text-lg sm:text-xl font-medium text-[var(--text-primary)] outline-none text-right placeholder:text-[var(--text-muted)] disabled:opacity-50"
              />
              <span className="font-medium text-[var(--text-secondary)] flex-shrink-0">USDC</span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center -my-3 relative z-10">
          <div className="bg-[var(--card-bg)] border-4 border-[var(--background)] rounded-lg p-3">
            <ArrowRight className="w-5 h-5 text-[var(--text-secondary)] rotate-90" />
          </div>
        </div>

        {/* Destination Chain */}
        <div className="bg-[var(--card-border)] rounded-lg p-3 sm:p-4 mt-2">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm text-[var(--text-secondary)]">To</span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => setShowDestSelect(!showDestSelect)}
              disabled={isBridging}
              className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 bg-[var(--card-bg)] hover:bg-[var(--card-border)] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 transition-colors disabled:opacity-50 min-h-[48px]"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <ChainLogo name={destChain.name} size={28} className="sm:w-8 sm:h-8" />
                <span className="font-medium text-[var(--text-primary)] text-sm sm:text-base">{destChain.name}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
            <div className="flex-1 text-right bg-[var(--card-bg)] sm:bg-transparent rounded-lg px-3 py-2 sm:p-0">
              <div className="text-xl sm:text-2xl font-medium text-[var(--text-primary)]">
                {amount || '0.00'}
              </div>
              <div className="text-xs sm:text-sm text-[var(--text-secondary)]">
                You will receive
              </div>
            </div>
          </div>
        </div>

        {/* Bridge Info */}
        {amount && !isBridging && (
          <div className="mt-4 p-4 bg-[var(--card-border)] rounded-lg space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Estimated Time</span>
              <span className="text-[var(--text-primary)]">{estimatedTime}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Bridge Fee</span>
              <span className="text-[var(--text-primary)]">{bridgeFee}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">You will receive</span>
              <span className="text-[var(--text-primary)] font-medium">
                ~{formatNumber(parseFloat(amount) * 0.999, 2)} USDC
              </span>
            </div>
          </div>
        )}

        {/* CCTP Info */}
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-green-200">
                <strong>Automatic delivery!</strong> Bridge Kit handles everything - approval, burn, attestation, and minting. Your USDC arrives automatically on the destination chain.
              </p>
            </div>
          </div>
        </div>

        {/* Bridge Button */}
        <button
          onClick={handleBridge}
          disabled={!isConnected || !amount || isBridging || parseFloat(amount) <= 0}
          className={cn(
            'w-full mt-4 py-3.5 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all flex items-center justify-center gap-2 min-h-[48px]',
            isConnected && amount && !isBridging && parseFloat(amount) > 0
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white active:scale-[0.98]'
              : 'bg-[var(--card-border)] text-[var(--text-muted)] cursor-not-allowed'
          )}
        >
          {isBridging ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> <span className="truncate">{currentStep || 'Bridging...'}</span></>
          ) : !isConnected ? (
            'Connect Wallet'
          ) : !amount || parseFloat(amount) <= 0 ? (
            'Enter Amount'
          ) : (
            <span className="truncate">Bridge to {destChain.name}</span>
          )}
        </button>

        {/* Arc Network Badge */}
        <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-[var(--text-muted)] text-center">
          <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse flex-shrink-0" />
          <span>Circle CCTP V2 • Fast Transfer • Auto-Delivery</span>
        </div>

        {/* Bridge Stats */}
        <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Protocol</span>
            <span className="text-[var(--text-primary)]">Circle Bridge Kit</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-[var(--text-secondary)]">Transfer Mode</span>
            <span className="text-[var(--text-primary)]">Fast (~30 sec)</span>
          </div>
        </div>
      </div>

      {/* Chain Select Modal */}
      {showDestSelect && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--card-bg)] rounded-t-xl sm:rounded-xl border border-[var(--card-border)] p-4 w-full max-w-sm sm:mx-4 safe-area-bottom animate-slide-up sm:animate-scale-in max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-[var(--card-bg)] pb-2">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Select Destination Chain
              </h3>
              <button
                onClick={() => setShowDestSelect(false)}
                className="p-2 rounded-lg hover:bg-[var(--card-border)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <span className="text-[var(--text-secondary)]">✕</span>
              </button>
            </div>
            <div className="space-y-1 sm:space-y-2">
              {BRIDGE_CHAINS.filter(c => c.id !== 'Arc_Testnet').map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => {
                    setDestChain(chain)
                    setShowDestSelect(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors min-h-[56px]',
                    destChain.id === chain.id
                      ? 'bg-[var(--primary)]/20 border border-[var(--primary)]/50'
                      : 'hover:bg-[var(--card-border)] active:bg-[var(--card-border)]'
                  )}
                >
                  <ChainLogo name={chain.name} size={36} />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-[var(--text-primary)]">{chain.name}</div>
                    <div className="text-sm text-[var(--text-secondary)]">Chain ID: {chain.chainId}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
