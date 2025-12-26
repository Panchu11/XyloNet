'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { ArrowRight, ArrowUpDown, Download, Upload, RefreshCw, ExternalLink, Clock, Trash2 } from 'lucide-react'
import { CONTRACTS, ARC_NETWORK } from '@/config/constants'
import { TokenLogo } from '@/components/ui/TokenLogos'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { cn, formatNumber } from '@/lib/utils'
import { Transaction, loadTransactions, clearTransactions } from '@/lib/transactions'

// Token address to symbol mapping
const TOKEN_MAP: Record<string, string> = {
  [CONTRACTS.USDC.toLowerCase()]: 'USDC',
  [CONTRACTS.EURC.toLowerCase()]: 'EURC',
  [CONTRACTS.USYC.toLowerCase()]: 'USYC',
}

export default function HistoryPage() {
  const { address, isConnected } = useAccount()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'swap' | 'liquidity' | 'vault' | 'bridge'>('all')

  const handleLoadTransactions = () => {
    const localTxs = loadTransactions()
    setTransactions(localTxs)
    setIsLoading(false)
  }

  const handleClearHistory = () => {
    clearTransactions()
    setTransactions([])
  }

  useEffect(() => {
    if (!address) {
      setTransactions([])
      setIsLoading(false)
      return
    }

    handleLoadTransactions()

    // Also try to fetch from Blockscout API and merge
    const fetchFromBlockscout = async () => {
      try {
        const response = await fetch(
          `https://testnet.arcscan.app/api/v2/addresses/${address}/transactions?filter=to%7Cfrom`
        )
        
        if (response.ok) {
          const data = await response.json()
          const apiTxs: Transaction[] = []
          
          for (const tx of data.items || []) {
            const toAddr = tx.to?.hash?.toLowerCase()
            const method = tx.method || ''
            
            let txType: Transaction['type'] | null = null
            let tokenIn = '', tokenOut = '', amountIn = '', amountOut = ''
            
            // Match against XyloNet contracts
            if (toAddr === CONTRACTS.ROUTER.toLowerCase()) {
              if (method.includes('swap')) {
                txType = 'swap'
                if (tx.decoded_input?.parameters) {
                  const params = tx.decoded_input.parameters
                  tokenIn = TOKEN_MAP[params[0]?.value?.toLowerCase()] || 'Unknown'
                  tokenOut = TOKEN_MAP[params[1]?.value?.toLowerCase()] || 'Unknown'
                  amountIn = formatUnits(BigInt(params[2]?.value || '0'), 6)
                }
              } else if (method.includes('addLiquidity')) {
                txType = 'add_liquidity'
              } else if (method.includes('removeLiquidity')) {
                txType = 'remove_liquidity'
              }
            } else if (toAddr === CONTRACTS.VAULT.toLowerCase()) {
              if (method.includes('deposit')) {
                txType = 'deposit'
                amountIn = formatUnits(BigInt(tx.value || '0'), 6)
              } else if (method.includes('withdraw')) {
                txType = 'withdraw'
              }
            } else if (toAddr === CONTRACTS.BRIDGE.toLowerCase()) {
              txType = 'bridge'
            } else if (toAddr === CONTRACTS.USDC_EURC_POOL.toLowerCase() || toAddr === CONTRACTS.USDC_USYC_POOL.toLowerCase()) {
              if (method.includes('addLiquidity')) {
                txType = 'add_liquidity'
              } else if (method.includes('removeLiquidity')) {
                txType = 'remove_liquidity'
              }
            }
            
            if (txType) {
              apiTxs.push({
                hash: tx.hash,
                type: txType,
                timestamp: new Date(tx.timestamp).getTime(),
                tokenIn,
                tokenOut,
                amountIn,
                amountOut,
                status: tx.status === 'ok' ? 'success' : tx.status === 'error' ? 'failed' : 'pending',
              })
            }
          }
          
          // Merge API transactions with local ones (avoid duplicates)
          if (apiTxs.length > 0) {
            setTransactions(prev => {
              const existingHashes = new Set(prev.map(t => t.hash))
              const newTxs = apiTxs.filter(t => !existingHashes.has(t.hash))
              return [...newTxs, ...prev].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50)
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch from Blockscout:', error)
      }
    }

    fetchFromBlockscout()
  }, [address])

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true
    if (filter === 'swap') return tx.type === 'swap'
    if (filter === 'liquidity') return tx.type === 'add_liquidity' || tx.type === 'remove_liquidity'
    if (filter === 'vault') return tx.type === 'deposit' || tx.type === 'withdraw'
    if (filter === 'bridge') return tx.type === 'bridge'
    return true
  })

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'swap':
        return <ArrowUpDown className="w-4 h-4" />
      case 'add_liquidity':
        return <Download className="w-4 h-4" />
      case 'remove_liquidity':
        return <Upload className="w-4 h-4" />
      case 'deposit':
        return <Download className="w-4 h-4" />
      case 'withdraw':
        return <Upload className="w-4 h-4" />
      case 'bridge':
        return <ArrowRight className="w-4 h-4" />
      case 'approve':
        return <RefreshCw className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'swap':
        return 'Swap'
      case 'add_liquidity':
        return 'Add Liquidity'
      case 'remove_liquidity':
        return 'Remove Liquidity'
      case 'deposit':
        return 'Vault Deposit'
      case 'withdraw':
        return 'Vault Withdraw'
      case 'bridge':
        return 'Bridge'
      case 'approve':
        return 'Approve'
    }
  }

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'swap':
        return 'bg-indigo-500/20 text-indigo-400'
      case 'add_liquidity':
        return 'bg-green-500/20 text-green-400'
      case 'remove_liquidity':
        return 'bg-orange-500/20 text-orange-400'
      case 'deposit':
        return 'bg-blue-500/20 text-blue-400'
      case 'withdraw':
        return 'bg-amber-500/20 text-amber-400'
      case 'bridge':
        return 'bg-purple-500/20 text-purple-400'
      case 'approve':
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12 bg-[var(--background)]">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Transaction History
              </span>
            </h1>
            <p className="text-[var(--text-secondary)]">
              View your recent swaps, liquidity, and vault transactions
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--card-border)] hover:bg-[var(--card-bg)] rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          {transactions.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'swap', 'liquidity', 'vault', 'bridge'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filter === f
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--card-bg)] hover:text-[var(--text-primary)]'
              )}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {!isConnected ? (
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--card-border)] flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Connect Wallet</h3>
            <p className="text-[var(--text-secondary)]">Connect your wallet to view transaction history</p>
          </div>
        ) : isLoading ? (
          <SkeletonTable />
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--card-border)] flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Transactions</h3>
            <p className="text-[var(--text-secondary)]">
              {filter === 'all' 
                ? "You haven't made any transactions yet" 
                : `No ${filter} transactions found`}
            </p>
          </div>
        ) : (
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--card-border)]">
                    <th className="text-left text-sm font-medium text-[var(--text-secondary)] px-6 py-4">Type</th>
                    <th className="text-left text-sm font-medium text-[var(--text-secondary)] px-6 py-4">Details</th>
                    <th className="text-left text-sm font-medium text-[var(--text-secondary)] px-6 py-4">Status</th>
                    <th className="text-left text-sm font-medium text-[var(--text-secondary)] px-6 py-4">Time</th>
                    <th className="text-right text-sm font-medium text-[var(--text-secondary)] px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.hash} className="hover:bg-[var(--card-border)] transition-colors">
                      <td className="px-6 py-4">
                        <div className={cn(
                          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm',
                          getTypeColor(tx.type)
                        )}>
                          {getTypeIcon(tx.type)}
                          {getTypeLabel(tx.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tx.type === 'swap' && tx.tokenIn && tx.tokenOut ? (
                          <div className="flex items-center gap-2">
                            <TokenLogo symbol={tx.tokenIn} size={20} />
                            <span className="text-[var(--text-primary)]">{tx.amountIn ? formatNumber(tx.amountIn, 2) : '?'} {tx.tokenIn}</span>
                            <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
                            <TokenLogo symbol={tx.tokenOut} size={20} />
                            <span className="text-[var(--text-primary)]">{tx.tokenOut}</span>
                          </div>
                        ) : (
                          <span className="text-[var(--text-secondary)]">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'inline-flex items-center gap-1 text-sm',
                          tx.status === 'success' ? 'text-[var(--success)]' :
                          tx.status === 'pending' ? 'text-[var(--warning)]' : 'text-[var(--error)]'
                        )}>
                          <span className={cn(
                            'w-2 h-2 rounded-full',
                            tx.status === 'success' ? 'bg-[var(--success)]' :
                            tx.status === 'pending' ? 'bg-[var(--warning)] animate-pulse' : 'bg-[var(--error)]'
                          )} />
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {formatTime(tx.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={`${ARC_NETWORK.explorer}/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:text-[var(--primary-hover)]"
                        >
                          View
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
