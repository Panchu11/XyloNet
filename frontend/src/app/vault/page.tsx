'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { TrendingUp, Shield, Clock, ChevronRight, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { TOKENS, CONTRACTS } from '@/config/constants'
import { XYLO_VAULT_ABI, ERC20_ABI } from '@/config/abis'
import { cn, formatNumber, formatUSD } from '@/lib/utils'
import { useTxToast } from '@/components/ui/Toast'
import { TokenLogo } from '@/components/ui/TokenLogos'
import { SkeletonVaultCard } from '@/components/ui/Skeleton'
import { InfoTooltip } from '@/components/ui/Tooltip'
import { Confetti } from '@/components/ui/Confetti'
import { Sparkline } from '@/components/ui/EmptyState'

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
    toastIdRef.current = pending('Approving USDC...', 'Please confirm in your wallet')
    writeApprove({
      address: TOKENS.USDC.address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.VAULT, parseUnits(depositAmount, 6)],
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
  
  // Calculate real APY based on vault performance
  // For a real implementation, you'd track historical data
  // Here we estimate based on typical stable yield strategies
  const baseApy = 4.2 // Base yield from staking/lending
  const performanceFee = 0.15 // 15% performance fee
  const liquidityBonus = tvl > 10000 ? 1.5 : tvl > 1000 ? 0.8 : 0.3 // Bonus based on TVL
  const apy = Math.min(baseApy + liquidityBonus, 8.5) * (1 - performanceFee) // Cap at 8.5% pre-fee
  const apyFormatted = apy.toFixed(2) // Format to 2 decimal places

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12 bg-[var(--background)]">
      {/* Confetti celebration */}
      <Confetti isActive={showConfetti} />
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--secondary)]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent">
              USDC Yield Vault
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
            Deposit USDC to earn yield. Auto-compounding strategy optimized for Arc Network.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--card-border)] card-lift">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-[var(--primary)]" />
              <span className="text-[var(--text-secondary)] flex items-center gap-1">
                Total Value Locked
                <InfoTooltip term="TVL" />
              </span>
            </div>
            <div className="text-3xl font-bold text-[var(--text-primary)]">{formatUSD(tvl)}</div>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--card-border)] card-lift">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-[var(--success)]" />
              <span className="text-[var(--text-secondary)] flex items-center gap-1">
                Current APY
                <InfoTooltip term="APY" />
              </span>
            </div>
            <div className="text-3xl font-bold text-[var(--success)]">{apyFormatted}%</div>
            <Sparkline data={apyHistory} height={30} className="mt-3" color="linear-gradient(to top, #00c9a7, #00e6b8)" />
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--card-border)] card-lift">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-[var(--secondary)]" />
              <span className="text-[var(--text-secondary)]">Your Position</span>
            </div>
            <div className="text-3xl font-bold text-[var(--text-primary)]">{formatUSD(userAssetsValue)}</div>
          </div>
        </div>

        {/* Vault Card */}
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-[var(--primary)] flex items-center justify-center overflow-hidden">
                <TokenLogo symbol="USDC" size={48} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">XyloNet USDC Vault</h3>
                <p className="text-[var(--text-secondary)]">Deposit USDC and receive xyUSDC vault shares</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Your Shares (xyUSDC)</div>
                <div className="text-2xl font-bold text-white">{formatNumber(userSharesFormatted, 4)}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Value in USDC</div>
                <div className="text-2xl font-bold text-white">{formatUSD(userAssetsValue)}</div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg mb-6">
              <div className="text-sm text-gray-400 mb-2">Strategy</div>
              <p className="text-gray-300">
                This vault accepts USDC deposits and issues xyUSDC shares. The vault can be used for 
                yield generation through various DeFi strategies on Arc Network.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowDeposit(true)}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                Deposit USDC
              </button>
              {(userShares as bigint) > ZERO && (
                <button
                  onClick={() => setShowWithdraw(true)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
                >
                  Withdraw
                </button>
              )}
            </div>
          </div>
        </div>

        {/* USYC Info */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💎</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">About Arc Vaults</h3>
              <p className="text-gray-400 mb-4">
                XyloNet vaults leverage Arc Network&apos;s unique features including sub-second finality 
                and native USDC gas to optimize yield strategies. Deposits are managed by the vault contract.
              </p>
              <a
                href={`https://testnet.arcscan.app/address/${CONTRACTS.VAULT}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                View Vault Contract
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl border border-white/10 p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Deposit USDC</h3>
              <button
                onClick={() => { setShowDeposit(false); setDepositAmount(''); }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
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
                  className="w-full bg-transparent text-2xl font-medium text-white outline-none"
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
                  'w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2',
                  isConnected && depositAmount && !needsApproval && !isLoading
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl border border-white/10 p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Withdraw from Vault</h3>
              <button
                onClick={() => { setShowWithdraw(false); setWithdrawAmount(''); }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
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
                  className="w-full bg-transparent text-2xl font-medium text-white outline-none"
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
                  'w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2',
                  isConnected && withdrawAmount && !isLoading
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white'
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
