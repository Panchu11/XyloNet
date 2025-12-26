import { http, createConfig } from 'wagmi'
import { type Chain } from 'viem'

// Arc Testnet Chain Definition
export const arcTestnet: Chain = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
      webSocket: ['wss://rpc.testnet.arc.network'],
    },
    public: {
      http: ['https://rpc.testnet.arc.network'],
      webSocket: ['wss://rpc.testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
}

export const config = createConfig({
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
  },
  ssr: true,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
