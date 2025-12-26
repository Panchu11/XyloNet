<p align="center">
  <img src="https://raw.githubusercontent.com/xylonet/brand/main/logo.svg" width="120" alt="XyloNet Logo" />
</p>

<h1 align="center">XyloNet</h1>

<p align="center">
  <strong>The Premier Stablecoin SuperExchange on Arc Network</strong>
</p>

<p align="center">
  <a href="https://xylonet.xyz">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#smart-contracts">Contracts</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Solidity-0.8.30-blue?style=flat-square" alt="Solidity" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square" alt="Next.js" />
  <img src="https://img.shields.io/badge/Arc_Network-Testnet-orange?style=flat-square" alt="Arc Network" />
  <img src="https://img.shields.io/badge/CCTP-V2-purple?style=flat-square" alt="CCTP V2" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

---

## Overview

**XyloNet** is a next-generation decentralized exchange (DEX) and cross-chain bridge purpose-built for [Arc Network's](https://arc.network) stablecoin-native architecture. We combine instant settlement, predictable gas fees, and native Circle integration to create the premier trading venue for the internet economy.

### Why XyloNet?

| Feature | Benefit |
|---------|---------|
| **Sub-350ms Finality** | Instant settlement for real-time trading |
| **~$0.01 Transactions** | Predictable costs in USDC, not volatile ETH |
| **Native CCTP V2** | True native USDC bridging, no wrapped tokens |
| **StableSwap AMM** | Minimal slippage on stablecoin pairs |
| **ERC-4626 Vaults** | Standardized yield-bearing positions |
| **Enterprise Ready** | Compliance-friendly architecture |

---

## Features

### XyloSwap - Stablecoin DEX
<img align="right" src="https://xylonet.xyz/screenshots/swap.png" width="300" />

- **StableSwap Curve**: Optimized for minimal slippage on pegged assets
- **Trading Pairs**: USDC ↔ EURC ↔ USYC
- **Low Fees**: 0.04% swap fee (4 basis points)
- **Multi-hop Routing**: Automatic path finding for best rates
- **Permit Support**: Gasless approvals with EIP-2612

<br clear="right"/>

### XyloBridge - Cross-Chain Bridge
<img align="right" src="https://xylonet.xyz/screenshots/bridge.png" width="300" />

- **Circle CCTP V2**: Native USDC, no wrapped tokens
- **Auto-Delivery**: Circle Bridge Kit for seamless transfers
- **6 Chains Supported**: Ethereum, Base, Arbitrum, Optimism, Polygon, Avalanche
- **Fast Mode**: ~30 second transfers
- **Standard Mode**: ~15-20 minute finality

<br clear="right"/>

### XyloVault - Yield Aggregation
<img align="right" src="https://xylonet.xyz/screenshots/vault.png" width="300" />

- **ERC-4626 Standard**: Composable yield-bearing tokens
- **USDC Deposits**: Earn yield on stablecoin holdings
- **Auto-Compounding**: Automated yield optimization
- **Real-time APY**: Live performance tracking

<br clear="right"/>

### Liquidity Pools
<img align="right" src="https://xylonet.xyz/screenshots/pools.png" width="300" />

- **Concentrated Liquidity**: Efficient capital deployment
- **LP Tokens**: Represent your share of the pool
- **Real-time Analytics**: Volume, TVL, and fee metrics
- **One-Sided Withdrawals**: Flexible liquidity removal

<br clear="right"/>

---

## Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **Git**
- **A Web3 wallet** (MetaMask, Rainbow, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/XyloNet.git
cd XyloNet

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Get Testnet Tokens

1. **Get Arc Testnet USDC**: Visit [Circle Faucet](https://faucet.circle.com) and select Arc Network
2. **Connect Wallet**: Add Arc Testnet to your wallet
3. **Start Trading**: Swap, provide liquidity, or bridge USDC

### Network Configuration

| Parameter | Value |
|-----------|-------|
| Network Name | Arc Testnet |
| Chain ID | 5042002 |
| RPC URL | https://rpc.testnet.arc.network |
| Currency | USDC |
| Block Explorer | https://testnet.arcscan.app |

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend                                │
│  Next.js 16 • TypeScript • Tailwind CSS • wagmi v2 • viem       │
├─────────────────────────────────────────────────────────────────┤
│                     Smart Contracts                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ XyloFactory │  │ XyloRouter  │  │     XyloStablePool      │  │
│  │ Pool Deploy │  │ Swap Route  │  │ StableSwap Curve (A=200)│  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────────────────────────────────┐   │
│  │ XyloVault   │  │              XyloBridge                  │   │
│  │ ERC-4626    │  │         CCTP V2 Integration              │   │
│  └─────────────┘  └─────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      Arc Network                                 │
│  Native USDC • Sub-second Finality • USDC Gas • Circle CCTP    │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
XyloNet/
├── contracts/                 # Smart contracts (Solidity)
│   ├── src/
│   │   ├── core/              # Core DEX contracts
│   │   │   ├── XyloFactory.sol
│   │   │   ├── XyloRouter.sol
│   │   │   ├── XyloStablePool.sol
│   │   │   └── XyloERC20.sol
│   │   ├── bridge/            # Cross-chain bridge
│   │   │   └── XyloBridge.sol
│   │   ├── vault/             # Yield vault
│   │   │   └── XyloVault.sol
│   │   └── interfaces/        # Contract interfaces
│   ├── scripts/               # Deployment scripts
│   ├── artifacts/             # Compiled contracts
│   └── hardhat.config.js
│
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── page.tsx       # Home / Swap
│   │   │   ├── bridge/        # Bridge page
│   │   │   ├── pools/         # Pools page
│   │   │   ├── vault/         # Vault page
│   │   │   └── history/       # Transaction history
│   │   ├── components/        # React components
│   │   │   ├── swap/          # SwapWidget
│   │   │   ├── bridge/        # BridgeWidget
│   │   │   └── ui/            # Reusable UI components
│   │   ├── config/            # Configuration
│   │   │   ├── wagmi.ts       # Web3 config
│   │   │   ├── constants.ts   # Contract addresses
│   │   │   └── abis/          # Contract ABIs
│   │   └── lib/               # Utilities
│   └── package.json
│
├── PROJECT_OVERVIEW.md        # Detailed project documentation
├── IMPLEMENTATION_PLAN.md     # Development roadmap
└── README.md                  # This file
```

---

## Smart Contracts

### Deployed Contracts (Arc Testnet)

| Contract | Address | Status |
|----------|---------|--------|
| **XyloFactory** | [`0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2`](https://testnet.arcscan.app/address/0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2) | ✅ Verified |
| **XyloRouter** | [`0x73742278c31a76dBb0D2587d03ef92E6E2141023`](https://testnet.arcscan.app/address/0x73742278c31a76dBb0D2587d03ef92E6E2141023) | ✅ Verified |
| **XyloBridge** | [`0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641`](https://testnet.arcscan.app/address/0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641) | ✅ Verified |
| **XyloVault** | [`0x240Eb85458CD41361bd8C3773253a1D78054f747`](https://testnet.arcscan.app/address/0x240Eb85458CD41361bd8C3773253a1D78054f747) | ✅ Verified |
| **USDC-EURC Pool** | [`0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1`](https://testnet.arcscan.app/address/0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1) | ✅ Verified |
| **USDC-USYC Pool** | [`0x8296cC7477A9CD12cF632042fDDc2aB89151bb61`](https://testnet.arcscan.app/address/0x8296cC7477A9CD12cF632042fDDc2aB89151bb61) | ✅ Verified |

### Arc Network Native Contracts

| Contract | Address |
|----------|---------|
| USDC (Native) | `0x3600000000000000000000000000000000000000` |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |
| USYC | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` |
| CCTP TokenMessengerV2 | `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA` |
| CCTP MessageTransmitterV2 | `0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275` |

### Contract Interactions

```typescript
import { useWriteContract } from 'wagmi';
import { CONTRACTS, XyloRouterABI } from '@/config';

// Example: Execute a swap
const { writeContract } = useWriteContract();

await writeContract({
  address: CONTRACTS.ROUTER,
  abi: XyloRouterABI,
  functionName: 'swap',
  args: [{
    tokenIn: USDC_ADDRESS,
    tokenOut: EURC_ADDRESS,
    amountIn: parseUnits('100', 6),
    minAmountOut: parseUnits('99', 6),
    to: userAddress,
    deadline: BigInt(Math.floor(Date.now() / 1000) + 3600)
  }]
});
```

---

## Tech Stack

### Smart Contracts
| Technology | Purpose |
|------------|---------|
| **Solidity 0.8.30** | Smart contract language |
| **Hardhat** | Development framework |
| **OpenZeppelin** | Security standards |
| **Curve StableSwap** | AMM algorithm |

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework (App Router) |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Styling |
| **wagmi v2** | Ethereum hooks |
| **viem** | Ethereum client |
| **RainbowKit** | Wallet connection |
| **Circle Bridge Kit** | Cross-chain UI |
| **Lucide React** | Icons |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting |
| **Arc Testnet** | Blockchain network |
| **Circle CCTP V2** | Cross-chain messaging |

---

## Supported Bridge Chains

| Chain | Domain ID | Network Type |
|-------|-----------|--------------|
| Ethereum (Sepolia) | 0 | Testnet |
| Avalanche (Fuji) | 1 | Testnet |
| Optimism (Sepolia) | 2 | Testnet |
| Arbitrum (Sepolia) | 3 | Testnet |
| Base (Sepolia) | 6 | Testnet |
| Polygon (Amoy) | 7 | Testnet |
| **Arc Network** | **26** | **Testnet** |

---

## Development

### Contract Development

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Arc Testnet
npx hardhat run scripts/deploy.js --network arcTestnet

# Verify contracts
npx hardhat verify --network arcTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Environment Variables

Create a `.env` file in the `contracts/` directory:

```env
PRIVATE_KEY=your_private_key_here
```

---

## Arc Builders Fund Alignment

XyloNet directly addresses the [Arc Builders Fund](https://www.circle.com/blog/introducing-the-arc-builders-fund) priority verticals:

| Vertical | XyloNet Implementation |
|----------|------------------------|
| **Always-on Markets** | 24/7 DEX with instant settlement |
| **Onchain FX** | Multi-stablecoin swaps (USDC/EURC/USYC) |
| **Offchain Assets** | USYC yield integration |
| **Cross-border Payments** | CCTP V2 bridge for global transfers |

---

## Roadmap

### Phase 1: Foundation ✅
- [x] Core smart contracts (Factory, Router, StablePool)
- [x] Frontend application
- [x] Arc Testnet deployment
- [x] Contract verification

### Phase 2: Bridge Integration ✅
- [x] CCTP V2 integration
- [x] Circle Bridge Kit
- [x] Multi-chain support

### Phase 3: Yield Features ✅
- [x] ERC-4626 vault
- [x] USDC yield strategies
- [x] APY tracking

### Phase 4: Advanced Features (Planned)
- [ ] StableFX RFQ integration
- [ ] Account abstraction (gasless)
- [ ] AI agent interface

### Phase 5: Governance (Planned)
- [ ] XYLO token launch
- [ ] Staking mechanism
- [ ] DAO governance

---

## Security

- All contracts are **verified** on Blockscout
- Implements **reentrancy guards** on all state-changing functions
- Uses **safe math** (Solidity 0.8+)
- Follows **CEI pattern** (Checks-Effects-Interactions)
- **Deadline validation** on all trades

See [SECURITY.md](./SECURITY.md) for security considerations and responsible disclosure.

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Resources

| Resource | Link |
|----------|------|
| **Live App** | https://xylonet.xyz |
| **Arc Network Docs** | https://docs.arc.network |
| **Arc Testnet Explorer** | https://testnet.arcscan.app |
| **Circle Faucet** | https://faucet.circle.com |
| **Arc Builders Fund** | https://www.circle.com/blog/introducing-the-arc-builders-fund |
| **Circle CCTP Docs** | https://developers.circle.com/stablecoins/cctp-getting-started |

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for the Arc Network ecosystem
</p>

<p align="center">
  <a href="https://arc.network">Arc Network</a> •
  <a href="https://circle.com">Circle</a> •
  <a href="https://xylonet.xyz">XyloNet</a>
</p>
