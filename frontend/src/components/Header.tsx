'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'
import { useAccount } from 'wagmi'
import { cn } from '@/lib/utils'
import { XyloNetLogoFallback } from './ui/TokenLogos'

const navLinks = [
  { href: '/', label: 'Swap' },
  { href: '/pools', label: 'Pools' },
  { href: '/bridge', label: 'Bridge' },
  { href: '/vault', label: 'Vault' },
  { href: '/history', label: 'History' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isConnected } = useAccount()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--card-border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
          <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg overflow-hidden transition-transform group-hover:scale-105">
            {/* Try to load custom logo, fallback to default */}
            <Image
              src="/logo.png"
              alt="XyloNet"
              width={32}
              height={32}
              className="object-contain"
              priority
              onError={(e) => {
                // Hide the image on error
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            {/* Fallback logo if image doesn't load */}
            <div className="absolute inset-0 -z-10">
              <XyloNetLogoFallback size={32} />
            </div>
          </div>
          <span className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
            XyloNet
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                pathname === link.href
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Network Status - Only show when connected */}
          {isConnected && (
            <div className="hidden sm:flex network-status">
              <div className="network-status-dot connected" />
              <span className="text-[var(--text-secondary)]">Arc</span>
              <Zap className="w-3 h-3 text-[var(--success)]" />
            </div>
          )}
          
          {/* Connect Button */}
          <div className="[&_button]:!px-2 [&_button]:!py-1.5 sm:[&_button]:!px-3 sm:[&_button]:!py-2 [&_button]:!text-sm [&_button]:!min-h-[36px] sm:[&_button]:!min-h-[40px]">
            <ConnectButton 
              showBalance={false}
              chainStatus="icon"
              accountStatus={{ smallScreen: 'avatar', largeScreen: 'address' }}
            />
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--card-border)] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[var(--text-primary)]" /> : <Menu className="w-5 h-5 text-[var(--text-primary)]" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--card-border)] bg-[var(--background)] animate-slide-up">
          <nav className="max-w-7xl mx-auto px-3 py-2 space-y-1 safe-area-bottom">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all min-h-[48px]',
                  pathname === link.href
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-border)] active:bg-[var(--card-border)]'
                )}
              >
                {link.label}
              </Link>
            ))}
            {/* Network status on mobile */}
            {isConnected && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-secondary)]">
                <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                <span>Connected to Arc Testnet</span>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
