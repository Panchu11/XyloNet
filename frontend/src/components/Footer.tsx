'use client'

// X (Twitter) Logo - New Design
function XLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

// Official Galxe Logomark (Comet design)
function GalxeLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="147 73.518 128.172 82"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m235.853 83.215-80.245 46.282 74.553-54.963a5.198 5.198 0 1 1 5.689 8.684l.003-.003z" />
      <path d="M247.319 123.27a3.901 3.901 0 0 0-5.327-1.424l-53.125 30.638 56.579-23.674a3.894 3.894 0 0 0 1.87-5.54h.003z" />
      <path d="M274.122 82.198c-2.247-3.888-7.306-5.09-11.064-2.63L147 155.518l123.87-62.433c4.012-2.023 5.5-7 3.252-10.887z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Credits */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span>Built with</span>
            <span className="text-red-500">♥</span>
            <span>by</span>
            <span className="font-semibold text-[var(--text-primary)]">
              ForgeLabs
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {/* X (Twitter) */}
            <a
              href="https://x.com/Xylonet_"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all duration-200 group"
              title="Follow us on X"
            >
              <XLogo className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                Follow
              </span>
            </a>

            {/* Galxe */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] opacity-60 cursor-not-allowed"
              title="Galxe - Coming Soon"
            >
              <GalxeLogo className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-sm text-[var(--text-muted)]">
                Galxe
              </span>
              <span className="text-xs text-[var(--text-muted)] bg-[var(--surface)] px-1.5 py-0.5 rounded">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} XyloNet. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
