import type { Metadata } from 'next';
import './payx.css';

export const metadata: Metadata = {
  title: 'PayX - Tip Anyone on X | XyloNet',
  description: 'Send and receive USDC tips on X/Twitter powered by Arc Network',
  keywords: ['tipping', 'X', 'Twitter', 'USDC', 'Arc Network', 'crypto', 'PayX', 'XyloNet'],
};

export default function PayXLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="payx-page min-h-screen">
      {children}
    </div>
  );
}
