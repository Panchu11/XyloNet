import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'XyloNet - Stablecoin SuperExchange',
    short_name: 'XyloNet',
    description: 'The premier DEX + Bridge on Arc Network. Swap, Bridge, and Earn with USDC, EURC.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0b0f',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
