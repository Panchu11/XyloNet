'use client'

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

          {/* Copyright */}
          <div className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} XyloNet. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
