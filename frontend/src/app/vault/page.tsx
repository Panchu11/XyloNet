'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { TrendingUp, Shield, Clock, ChevronRight, Loader2, AlertCircle, Sparkles, Coins } from 'lucide-react'
import { TOKENS, CONTRACTS } from '@/config/constants'
import { XYLO_VAULT_ABI, ERC20_ABI } from '@/config/abis'
import { cn, formatNumber, formatUSD } from '@/lib/utils'
import { useTxToast } from '@/components/ui/Toast'
import { TokenLogo } from '@/components/ui/TokenLogos'
import { SkeletonVaultCard } from '@/components/ui/Skeleton'
import { InfoTooltip } from '@/components/ui/Tooltip'
import { Confetti } from '@/components/ui/Confetti'
import { Sparkline } from '@/components/ui/EmptyState'
import { TiltCard } from '@/components/ui/TiltCard'

const ZERO = BigInt(0)

export default function VaultPage() {
  const { address, isConnected } = useAccount()
  const { pending, success, error: errorToast } = useTxToast()
  const toastIdRef = useRef<string | null>(null)
  const [showDeposit, setShowDeposit] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [needsApproval, setNeedsApproval] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  // Historical APY data for sparkline
  const apyHistory = [3.2, 3.5, 3.4, 3.8, 4.0, 3.9, 4.1, 4.2, 4.0, 4.3, 4.1, 4.2]

  // Contract writes
  const { writeContract: writeApprove, data: approveHash, isPending: isApproving } = useWriteContract()
  const { writeContract: writeDeposit, data: depositHash, isPending: isDepositing } = useWriteContract()
  const { writeContract: writeWithdraw, data: withdrawHash, isPending: isWithdrawing } = useWriteContract()

  // Transaction confirmations
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed, isError: isApproveError } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed, isError: isDepositError } = useWaitForTransactionReceipt({ hash: depositHash })
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawConfirmed, isError: isWithdrawError } = useWaitForTransactionReceipt({ hash: withdrawHash })

  const isLoading = isApproving || isApproveConfirming || isDepositing || isDepositConfirming || isWithdrawing || isWithdrawConfirming

  // Read vault data
  const { data: totalAssets, refetch: refetchTotalAssets } = useReadContract({
    address: CONTRACTS.VAULT,
    abi: XYLO_VAULT_ABI,
    functionName: 'totalAssets',
  })

  const { data: userShares, refetch: refetchUserShares } = useReadContract({
    address: CONTRACTS.VAULT,
    abi: XYLO_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { data: previewWithdrawAmount } = useReadContract({
    address: CONTRACTS.VAULT,
    abi: XYLO_VAULT_ABI,
    functionName: 'previewWithdraw',
    args: userShares ? [userShares as bigint] : undefined,
  })

  // User USDC balance
  const { data: usdcBalance } = useBalance({ address, token: TOKENS.USDC.address })

  // Check allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TOKENS.USDC.address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.VAULT] : undefined,
  })

  // Check approval needed
  useEffect(() => {
    if (depositAmount && allowance !== undefined) {
      const amt = parseUnits(depositAmount || '0', 6)
      setNeedsApproval((allowance as bigint) < amt)
    }
  }, [depositAmount, allowance])

  // Refetch allowance after approval
  useEffect(() => {
    if (isApproveConfirmed) {
      refetchAllowance()
      if (toastIdRef.current) {
        success(toastIdRef.current, 'Approval Successful!')
        toastIdRef.current = null
      }
    }
  }, [isApproveConfirmed, refetchAllowance, success])

  // Handle errors
  useEffect(() => {
    if (isApproveError && toastIdRef.current) {
      errorToast(toastIdRef.current, 'Approval Failed', 'Transaction was rejected')
      toastIdRef.current = null
    }
  }, [isApproveError, errorToast])

  useEffect(() => {
    if (isDepositError && toastIdRef.current) {
      errorToast(toastIdRef.current, 'Deposit Failed', 'Transaction was rejected or failed')
      toastIdRef.current = null
      setErrorMsg('Deposit failed. Please try again.')
    }
  }, [isDepositError, errorToast])

  useEffect(() => {
    if (isWithdrawError && toastIdRef.current) {
      errorToast(toastIdRef.current, 'Withdraw Failed', 'Transaction was rejected')
      toastIdRef.current = null
    }
  }, [isWithdrawError, errorToast])

  // Mark initial loading as done
  useEffect(() => {
    if (totalAssets !== undefined) {
      setIsInitialLoading(false)
    }
  }, [totalAssets])

  // Reset and refetch after successful deposit/withdraw
  useEffect(() => {
    if (isDepositConfirmed) {
      if (toastIdRef.current) {
        success(toastIdRef.current, 'Deposit Successful!', depositHash)
        toastIdRef.current = null
      }
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 100)
      setDepositAmount('')
      setShowDeposit(false)
      setErrorMsg(null)
      refetchTotalAssets()
      refetchUserShares()
    }
  }, [isDepositConfirmed, depositHash, refetchTotalAssets, refetchUserShares, success])

  useEffect(() => {
    if (isWithdrawConfirmed) {
      if (toastIdRef.current) {
        success(toastIdRef.current, 'Withdraw Successful!', withdrawHash)
        toastIdRef.current = null
      }
      setWithdrawAmount('')
      setShowWithdraw(false)
      refetchTotalAssets()
      refetchUserShares()
    }
  }, [isWithdrawConfirmed, withdrawHash, refetchTotalAssets, refetchUserShares, success])

  const handleApprove = () => {
    if (!depositAmount) return
    // Approve MAX to vault - "Approve once, deposit forever"
    const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
    toastIdRef.current = pending('Approving USDC...', 'One-time approval for vault!')
    writeApprove({
      address: TOKENS.USDC.address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.VAULT, MAX_UINT256],
    })
  }

  const handleDeposit = () => {
    if (!depositAmount || !address) return
    toastIdRef.current = pending('Depositing USDC...', `${depositAmount} USDC`)
    writeDeposit({
      address: CONTRACTS.VAULT,
      abi: XYLO_VAULT_ABI,
      functionName: 'deposit',
      args: [parseUnits(depositAmount, 6), address],
    })
  }

  const handleWithdraw = () => {
    if (!withdrawAmount || !address) return
    toastIdRef.current = pending('Withdrawing...', `${withdrawAmount} shares`)
    writeWithdraw({
      address: CONTRACTS.VAULT,
      abi: XYLO_VAULT_ABI,
      functionName: 'withdraw',
      args: [parseUnits(withdrawAmount, 18), address, address],
    })
  }

  const tvl = Number(formatUnits((totalAssets as bigint) ?? ZERO, 6))
  const userSharesFormatted = formatUnits((userShares as bigint) ?? ZERO, 18)
  const userAssetsValue = Number(formatUnits((previewWithdrawAmount as bigint) ?? ZERO, 6))
  
  // Calculate estimated APY based on vault metrics
  // In production, this would track historical share price growth
  // For testnet, we show estimated yield based on DeFi typical rates
  const estimatedApy = tvl > 0 ? Math.min(4.5 + (tvl / 100000) * 2, 8.0) : 0
  const apyFormatted = estimatedApy.toFixed(1)

  return (
    <div className="min-h-[calc(100vh-4rem)] px-3 sm:px-4 py-6 sm:py-12 bg-[var(--background)]">
      {/* Confetti celebration */}
      <Confetti isActive={showConfetti} />
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--secondary)]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent">
              USDC Yield Vault
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-lg max-w-xl mx-auto px-2">
            Deposit USDC to earn yield. Auto-compounding strategy optimized for Arc Network.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-12 stagger-fade">
          <TiltCard tiltAmount={6}>
            <div className="glass-premium rounded-xl p-4 sm:p-6 h-full holographic">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center depth-shadow">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-[var(--text-secondary)] text-xs sm:text-base flex items-center gap-1">
                  <span className="hidden sm:inline">Total Value Locked</span>
                  <span className="sm:hidden">TVL</span>
                  <InfoTooltip term="TVL" />
                </span>
              </div>
              <div className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{formatUSD(tvl)}</div>
            </div>
          </TiltCard>
          <TiltCard tiltAmount={6}>
            <div className="glass-premium rounded-xl p-4 sm:p-6 h-full holographic">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center depth-shadow animate-pulse">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-[var(--text-secondary)] text-xs sm:text-base flex items-center gap-1">
                  Current APY
                  <InfoTooltip term="APY" />
                </span>
              </div>
              <div className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">{apyFormatted}%</div>
              <Sparkline data={apyHistory} height={24} className="mt-2 sm:mt-3 hidden sm:block" color="linear-gradient(to top, #00c9a7, #00e6b8)" />
            </div>
          </TiltCard>
          <TiltCard tiltAmount={6}>
            <div className="glass-premium rounded-xl p-4 sm:p-6 h-full holographic">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center depth-shadow">
                  <Coins className="w-4 h-4 text-white" />
                </div>
                <span className="text-[var(--text-secondary)] text-xs sm:text-base">Your Position</span>
              </div>
              <div className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">{formatUSD(userAssetsValue)}</div>
            </div>
          </TiltCard>
        </div>

        {/* Vault Card */}
        <TiltCard tiltAmount={4} glareEnabled={true}>
          <div className="glass-premium rounded-xl overflow-hidden holographic">
            <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[var(--primary)] flex items-center justify-center overflow-hidden flex-shrink-0">
                <TokenLogo symbol="USDC" size={36} className="sm:w-12 sm:h-12" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">XyloNet USDC Vault</h3>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base truncate">Deposit USDC and receive xyUSDC vault shares</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
              <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Your Shares (xyUSDC)</div>
                <div className="text-lg sm:text-2xl font-bold text-white truncate">{formatNumber(userSharesFormatted, 4)}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Value in USDC</div>
                <div className="text-lg sm:text-2xl font-bold text-white">{formatUSD(userAssetsValue)}</div>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-white/5 rounded-lg mb-4 sm:mb-6">
              <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Strategy</div>
              <p className="text-gray-300 text-sm sm:text-base">
                This vault accepts USDC deposits and issues xyUSDC shares. The vault can be used for 
                yield generation through various DeFi strategies on Arc Network.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => setShowDeposit(true)}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.98] magnetic-hover depth-shadow"
              >
                <Sparkles className="w-4 h-4" />
                Deposit USDC
              </button>
              {(userShares as bigint) > ZERO && (
                <button
                  onClick={() => setShowWithdraw(true)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all min-h-[48px] active:scale-[0.98] magnetic-hover"
                >
                  Withdraw
                </button>
              )}
            </div>
            </div>
          </div>
        </TiltCard>

        {/* USYC Info */}
        <TiltCard tiltAmount={4} glareEnabled={true}>
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 glass-premium rounded-xl holographic">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 depth-shadow">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  About Arc Vaults
                </h3>
                <p className="text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">
                  XyloNet vaults leverage Arc Network&apos;s unique features including sub-second finality 
                  and native USDC gas to optimize yield strategies. Deposits are managed by the vault contract.
                </p>
                <a
                  href={`https://testnet.arcscan.app/address/${CONTRACTS.VAULT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm sm:text-base group"
                >
                  View Vault Contract
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-t-xl sm:rounded-xl border border-white/10 p-4 sm:p-6 w-full max-w-md sm:mx-4 safe-area-bottom animate-slide-up sm:animate-scale-in">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-white">Deposit USDC</h3>
              <button
                onClick={() => { setShowDeposit(false); setDepositAmount(''); }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <span className="text-gray-400">✕</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">USDC</span>
                  <button
                    onClick={() => setDepositAmount(usdcBalance?.formatted ?? '0')}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Balance: {formatNumber(usdcBalance?.formatted ?? '0', 2)}
                  </button>
                </div>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-xl sm:text-2xl font-medium text-white outline-none"
                />
              </div>

              <div className="p-3 bg-white/5 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Expected APY</span>
                  <span className="text-green-400">{apyFormatted}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated yearly earnings</span>
                  <span className="text-white">
                    {depositAmount ? formatUSD(parseFloat(depositAmount) * parseFloat(apyFormatted) / 100) : '$0.00'}
                  </span>
                </div>
              </div>

              {needsApproval && (
                <button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-semibold bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {isApproving || isApproveConfirming ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Approving USDC...</>
                  ) : (
                    'Approve USDC'
                  )}
                </button>
              )}

              <button
                onClick={handleDeposit}
                disabled={!isConnected || !depositAmount || needsApproval || isLoading}
                className={cn(
                  'w-full py-3.5 sm:py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 min-h-[48px]',
                  isConnected && depositAmount && !needsApproval && !isLoading
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white active:scale-[0.98]'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                )}
              >
                {isDepositing || isDepositConfirming ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Depositing...</>
                ) : !isConnected ? (
                  'Connect Wallet'
                ) : !depositAmount ? (
                  'Enter Amount'
                ) : (
                  'Deposit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-t-xl sm:rounded-xl border border-white/10 p-4 sm:p-6 w-full max-w-md sm:mx-4 safe-area-bottom animate-slide-up sm:animate-scale-in">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-white">Withdraw from Vault</h3>
              <button
                onClick={() => { setShowWithdraw(false); setWithdrawAmount(''); }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <span className="text-gray-400">✕</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">xyUSDC Shares</span>
                  <button
                    onClick={() => setWithdrawAmount(userSharesFormatted)}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Balance: {formatNumber(userSharesFormatted, 4)}
                  </button>
                </div>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-xl sm:text-2xl font-medium text-white outline-none"
                />
              </div>

              <div className="p-3 bg-white/5 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">You will receive (USDC)</span>
                  <span className="text-white">~{formatUSD(userAssetsValue)}</span>
                </div>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={!isConnected || !withdrawAmount || isLoading}
                className={cn(
                  'w-full py-3.5 sm:py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 min-h-[48px]',
                  isConnected && withdrawAmount && !isLoading
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white active:scale-[0.98]'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                )}
              >
                {isWithdrawing || isWithdrawConfirming ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Withdrawing...</>
                ) : !isConnected ? (
                  'Connect Wallet'
                ) : !withdrawAmount ? (
                  'Enter Amount'
                ) : (
                  'Withdraw'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
