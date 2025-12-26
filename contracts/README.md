# XyloNet Smart Contracts

> Solidity smart contracts powering the XyloNet DEX on Arc Network

## Overview

XyloNet's smart contract suite implements a StableSwap AMM optimized for stablecoin trading on Arc Network. The contracts leverage Arc's sub-second finality and native USDC gas payments for an exceptional trading experience.

## Contract Architecture

```
contracts/
├── src/
│   ├── core/
│   │   ├── XyloFactory.sol      # Pool deployment factory
│   │   ├── XyloRouter.sol       # Trade routing & execution
│   │   ├── XyloStablePool.sol   # StableSwap AMM pool
│   │   └── XyloERC20.sol        # LP token implementation
│   ├── bridge/
│   │   └── XyloBridge.sol       # Circle CCTP V2 bridge
│   ├── vault/
│   │   └── XyloVault.sol        # ERC-4626 yield vault
│   └── interfaces/
│       ├── IERC20.sol
│       ├── IXyloFactory.sol
│       ├── IXyloPool.sol
│       └── IXyloRouter.sol
├── scripts/
│   ├── deploy.js                # Main deployment script
│   └── add-liquidity.js         # Liquidity provisioning
├── hardhat.config.js
└── package.json
```

---

## Core Contracts

### XyloFactory

The factory contract manages pool deployment and protocol configuration.

**Address:** `0x60EDeFB094B84BBC6430cc130B358A43Ba1979e2`

#### Key Functions

| Function | Description |
|----------|-------------|
| `createPool(tokenA, tokenB, A)` | Deploy a new StableSwap pool |
| `getPool(tokenA, tokenB)` | Get pool address for a token pair |
| `setSwapFee(fee)` | Update global swap fee (owner only) |
| `setFeeRecipient(recipient)` | Set protocol fee recipient |

#### Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `swapFee` | 4 bps (0.04%) | Fee on each swap |
| `protocolFee` | 50% | Portion of swap fee to protocol |
| `defaultA` | 200 | Default amplification parameter |

---

### XyloRouter

The router provides a user-friendly interface for swaps and liquidity operations.

**Address:** `0x73742278c31a76dBb0D2587d03ef92E6E2141023`

#### Swap Functions

```solidity
// Simple swap
function swap(SwapParams calldata params) external returns (uint256 amountOut);

// Multi-hop swap
function swapExactTokensForTokens(
    uint256 amountIn,
    uint256 minAmountOut,
    address[] calldata path,
    address to,
    uint256 deadline
) external returns (uint256[] memory amounts);

// Swap with permit (gasless approval)
function swapWithPermit(
    SwapParams calldata swapParams,
    uint256 permitDeadline,
    uint8 v, bytes32 r, bytes32 s
) external returns (uint256 amountOut);
```

#### Liquidity Functions

```solidity
// Add liquidity
function addLiquidity(AddLiquidityParams calldata params) 
    external returns (uint256 lpTokens);

// Remove liquidity (both tokens)
function removeLiquidity(RemoveLiquidityParams calldata params) 
    external returns (uint256 amountA, uint256 amountB);

// Remove liquidity (single token)
function removeLiquidityOne(
    address tokenA, address tokenB,
    uint256 lpTokenAmount, uint256 tokenIndex,
    uint256 minAmount, address to, uint256 deadline
) external returns (uint256 amount);
```

#### View Functions

```solidity
// Get expected output for a swap
function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) 
    external view returns (uint256 amountOut);

// Get quote with price impact
function quote(address tokenIn, address tokenOut, uint256 amountIn)
    external view returns (uint256 amountOut, uint256 priceImpact);
```

---

### XyloStablePool

Each pool implements Curve's StableSwap invariant for minimal slippage on pegged assets.

**USDC-EURC Pool:** `0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1`  
**USDC-USYC Pool:** `0x8296cC7477A9CD12cF632042fDDc2aB89151bb61`

#### StableSwap Curve

The pool uses the StableSwap invariant:

```
A * n^n * sum(x_i) + D = A * D * n^n + D^(n+1) / (n^n * prod(x_i))
```

Where:
- `A` = Amplification parameter (controls curve tightness)
- `n` = Number of tokens (2 for pairs)
- `D` = Total liquidity
- `x_i` = Reserve of token i

#### Key Functions

```solidity
// Execute a swap
function swap(
    address tokenIn, address tokenOut,
    uint256 amountIn, uint256 minAmountOut,
    address to, uint256 deadline
) external returns (uint256 amountOut);

// Add liquidity
function addLiquidity(
    uint256[] calldata amounts,
    uint256 minLpTokens,
    address to, uint256 deadline
) external returns (uint256 lpTokens);

// Remove liquidity
function removeLiquidity(
    uint256 lpTokenAmount,
    uint256[] calldata minAmounts,
    address to, uint256 deadline
) external returns (uint256[] memory amounts);
```

#### Pool Parameters

| Parameter | USDC-EURC | USDC-USYC |
|-----------|-----------|-----------|
| Amplification (A) | 200 | 200 |
| Swap Fee | 0.04% | 0.04% |
| Token Decimals | 6, 6 | 6, 18 |

---

### XyloBridge

Cross-chain USDC bridge using Circle's CCTP V2 protocol.

**Address:** `0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641`

#### Bridge Functions

```solidity
// Bridge USDC to another chain
function bridgeOut(
    uint256 amount,
    uint32 destinationDomain,
    bytes32 recipient
) external returns (bytes32 nonce);

// Bridge by chain name
function bridgeToChain(
    uint256 amount,
    string calldata chainName,
    address recipient
) external returns (bytes32 nonce);

// Complete incoming bridge transfer
function bridgeIn(
    bytes calldata message,
    bytes calldata attestation
) external returns (bool success);
```

#### Supported Chains

| Chain | Domain ID |
|-------|-----------|
| Ethereum | 0 |
| Avalanche | 1 |
| Optimism | 2 |
| Arbitrum | 3 |
| Base | 6 |
| Polygon | 7 |
| Arc | 26 |

---

### XyloVault

ERC-4626 compliant yield vault for USDC deposits.

**Address:** `0x240Eb85458CD41361bd8C3773253a1D78054f747`

#### Vault Functions

```solidity
// Deposit assets, receive shares
function deposit(uint256 assets, address receiver) 
    external returns (uint256 shares);

// Withdraw assets by burning shares
function withdraw(uint256 assets, address receiver, address owner) 
    external returns (uint256 shares);

// Redeem shares for assets
function redeem(uint256 shares, address receiver, address owner) 
    external returns (uint256 assets);

// Harvest profits
function harvest() external returns (uint256 profit);
```

#### Fee Structure

| Fee Type | Default | Max |
|----------|---------|-----|
| Deposit Fee | 0% | 20% |
| Withdraw Fee | 0.1% | 20% |
| Performance Fee | 10% | 20% |

---

## Deployment

### Prerequisites

```bash
npm install
```

### Configure Environment

Create `.env` file:

```env
PRIVATE_KEY=your_private_key_here
```

### Deploy to Arc Testnet

```bash
# Compile contracts
npx hardhat compile

# Deploy all contracts
npx hardhat run scripts/deploy.js --network arcTestnet

# Verify contracts
npx hardhat verify --network arcTestnet 0x... <constructor_args>
```

### Add Initial Liquidity

```bash
npx hardhat run scripts/add-liquidity.js --network arcTestnet
```

---

## Testing

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run coverage
npx hardhat coverage
```

---

## Security Considerations

### Implemented Safeguards

1. **Reentrancy Protection**
   - All state-changing functions use `lock` modifier
   - Follows CEI (Checks-Effects-Interactions) pattern

2. **Access Control**
   - Owner-only functions for sensitive operations
   - Two-step ownership transfer

3. **Validation**
   - Deadline checks on all trades
   - Minimum output validation
   - Zero address checks

4. **Safe Math**
   - Solidity 0.8+ with built-in overflow checks
   - Precision handling for different decimals

### Known Limitations

- StableSwap assumes tokens maintain their peg
- No emergency pause mechanism (planned for v2)
- Pool imbalance can increase slippage

---

## Integration Examples

### JavaScript/TypeScript

```typescript
import { ethers } from 'ethers';
import { XyloRouterABI } from './abis';

const provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network');
const router = new ethers.Contract(ROUTER_ADDRESS, XyloRouterABI, signer);

// Get swap quote
const amountOut = await router.getAmountOut(USDC, EURC, ethers.parseUnits('100', 6));

// Execute swap
const tx = await router.swap({
  tokenIn: USDC,
  tokenOut: EURC,
  amountIn: ethers.parseUnits('100', 6),
  minAmountOut: amountOut * 99n / 100n, // 1% slippage
  to: userAddress,
  deadline: Math.floor(Date.now() / 1000) + 3600
});
await tx.wait();
```

### React/wagmi

```typescript
import { useWriteContract, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';

// Read quote
const { data: amountOut } = useReadContract({
  address: ROUTER_ADDRESS,
  abi: XyloRouterABI,
  functionName: 'getAmountOut',
  args: [USDC, EURC, parseUnits('100', 6)]
});

// Write swap
const { writeContract } = useWriteContract();

const handleSwap = () => {
  writeContract({
    address: ROUTER_ADDRESS,
    abi: XyloRouterABI,
    functionName: 'swap',
    args: [{
      tokenIn: USDC,
      tokenOut: EURC,
      amountIn: parseUnits('100', 6),
      minAmountOut: amountOut * 99n / 100n,
      to: userAddress,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 3600)
    }]
  });
};
```

---

## Gas Estimates

| Operation | Estimated Gas | Cost (~$0.01/unit) |
|-----------|--------------|-------------------|
| Swap | ~120,000 | ~$0.0012 |
| Add Liquidity | ~180,000 | ~$0.0018 |
| Remove Liquidity | ~150,000 | ~$0.0015 |
| Bridge Out | ~100,000 | ~$0.0010 |
| Vault Deposit | ~80,000 | ~$0.0008 |

*Gas costs on Arc are extremely low due to USDC-denominated fees*

---

## License

MIT License - see [LICENSE](../LICENSE) for details.
