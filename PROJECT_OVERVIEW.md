# XyloNet - Stablecoin SuperExchange on Arc Network

## Vision
XyloNet is a next-generation DEX + Cross-Chain Bridge purpose-built for Arc Network's stablecoin-native architecture. We combine instant settlement, zero volatility gas fees, and native Circle integration to create the premier trading venue for the internet economy.

## Core Value Proposition
- **Instant Settlement**: <350ms deterministic finality
- **Predictable Costs**: ~$0.01 per transaction in USDC
- **Native Cross-Chain**: Circle CCTP-powered bridge with auto-delivery
- **Yield Integration**: USYC Treasury-backed yields
- **Enterprise Ready**: Compliance-friendly with opt-in privacy

## Key Features

### 1. XyloSwap - Stablecoin DEX
- StableSwap curve optimized for minimal slippage
- USDC ↔ EURC ↔ USYC trading pairs
- Concentrated liquidity positions
- Low slippage on large trades

### 2. XyloBridge - Cross-Chain Bridge  
- Native CCTP V2 integration (no wrapped tokens)
- Circle Bridge Kit for automatic delivery
- Support for Ethereum, Base, Arbitrum, Optimism, Polygon, Avalanche
- Fast transfer mode (~30 seconds)
- Standard transfer mode (~15-20 minutes)

### 3. XyloVault - Yield Aggregation
- ERC-4626 compliant vault
- USDC deposits for yield generation
- Auto-compounding vaults
- Real-time APY tracking

## Deployed Contracts (Arc Testnet)

### XyloNet Contracts
| Contract | Address | Explorer |
|----------|---------|----------|
| XyloFactory | 0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2 | [View](https://testnet.arcscan.app/address/0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2) |
| XyloRouter | 0x73742278c31a76dBb0D2587d03ef92E6E2141023 | [View](https://testnet.arcscan.app/address/0x73742278c31a76dBb0D2587d03ef92E6E2141023) |
| XyloBridge | 0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641 | [View](https://testnet.arcscan.app/address/0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641) |
| XyloVault | 0x240Eb85458CD41361bd8C3773253a1D78054f747 | [View](https://testnet.arcscan.app/address/0x240Eb85458CD41361bd8C3773253a1D78054f747) |
| USDC-EURC Pool | 0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1 | [View](https://testnet.arcscan.app/address/0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1) |
| USDC-USYC Pool | 0x8296cC7477A9CD12cF632042fDDc2aB89151bb61 | [View](https://testnet.arcscan.app/address/0x8296cC7477A9CD12cF632042fDDc2aB89151bb61) |

### Arc Network Native Contracts
| Contract | Address |
|----------|---------|
| USDC (Native) | 0x3600000000000000000000000000000000000000 |
| EURC | 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a |
| USYC | 0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C |
| CCTP TokenMessengerV2 | 0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA |
| CCTP MessageTransmitterV2 | 0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275 |
| Gateway Wallet | 0x0077777d7EBA4688BDeF3E311b846F25870A19B9 |
| FxEscrow (StableFX) | 0x1f91886C7028986aD885ffCee0e40b75C9cd5aC1 |
| Permit2 | 0x000000000022D473030F116dDEE9F6B43aC78BA3 |
| Multicall3 | 0xcA11bde05977b3631167028862bE2a173976CA11 |

## Technical Stack

### Smart Contracts
- Solidity 0.8.30
- Hardhat for development
- StableSwap curve (Curve Finance invariant)

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- wagmi v2 + viem
- RainbowKit for wallet connection
- Circle Bridge Kit for cross-chain

### Infrastructure
- Arc Testnet (Chain ID: 5042002)
- RPC: https://rpc.testnet.arc.network
- Explorer: https://testnet.arcscan.app

## Supported Bridge Chains

| Chain | Domain ID | Type |
|-------|-----------|------|
| Ethereum Sepolia | 0 | Testnet |
| Arbitrum Sepolia | 3 | Testnet |
| Base Sepolia | 6 | Testnet |
| Optimism Sepolia | 2 | Testnet |
| Polygon Amoy | 7 | Testnet |
| Avalanche Fuji | 1 | Testnet |
| Arc Testnet | 26 | Testnet |

## Grant Alignment (Arc Builders Fund)

XyloNet directly addresses the fund's priority verticals:
1. ✅ Always-on Markets & Capital Formation (DEX/AMM)
2. ✅ Onchain FX (Multi-stablecoin swaps)
3. ✅ Offchain Assets & Credit (USYC yield integration)
4. ✅ Cross-border Payments (CCTP bridge)

## Getting Started

### Prerequisites
- Node.js 18+
- Git

### Run Locally
```bash
# Clone the repo
git clone <repo-url>
cd XyloNet

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

### Environment Variables
Copy `.env.example` to `.env` and fill in:
- `PRIVATE_KEY` - Deployment wallet private key
- All contract addresses are pre-configured

## Links
- Arc Docs: https://docs.arc.network
- Arc Testnet Explorer: https://testnet.arcscan.app
- Circle Faucet: https://faucet.circle.com
- Arc Builders Fund: https://www.circle.com/blog/introducing-the-arc-builders-fund
