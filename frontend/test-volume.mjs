// Test script to query real volume data from Arc blockchain
import { createPublicClient, http, parseAbiItem, formatUnits } from 'viem';

const ARC_RPC = 'https://rpc.testnet.arc.network';

// Contract addresses
const CONTRACTS = {
  USDC_EURC_POOL: '0x3DF3966F5138143dce7a9cFDdC2c0310ce083BB1',
  USDC_USYC_POOL: '0x8296cC7477A9CD12cF632042fDDc2aB89151bb61',
  TOKEN_MESSENGER: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
  BRIDGE: '0xf7Df65Ce418E938ee8d9a0A0d227A43441fe4641',
};

// Event signatures
const SWAP_EVENT = parseAbiItem('event Swap(address indexed sender, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut, address to)');
const DEPOSIT_FOR_BURN_EVENT = parseAbiItem('event DepositForBurn(uint64 indexed nonce, address indexed burnToken, uint256 amount, address indexed depositor, bytes32 mintRecipient, uint32 destinationDomain, bytes32 destinationTokenMessenger, bytes32 destinationCaller)');

const client = createPublicClient({
  transport: http(ARC_RPC),
});

async function testVolumeQueries() {
  console.log('🔍 Testing Volume Queries on Arc Testnet\n');

  try {
    // Get current block
    const currentBlock = await client.getBlockNumber();
    console.log('📦 Current Block:', currentBlock.toString());
    console.log('');

    // Test 1: Query USDC-EURC Pool Swap events
    console.log('--- Test 1: USDC-EURC Pool Swaps ---');
    try {
      const pool1Logs = await client.getLogs({
        address: CONTRACTS.USDC_EURC_POOL,
        event: SWAP_EVENT,
        fromBlock: 0n,
        toBlock: currentBlock,
      });
      
      let pool1Volume = 0;
      pool1Logs.forEach((log) => {
        const amountIn = log.args.amountIn;
        if (amountIn) {
          pool1Volume += Number(formatUnits(amountIn, 6));
        }
      });
      
      console.log(`✅ Found ${pool1Logs.length} swap events`);
      console.log(`💰 Total Volume: $${pool1Volume.toLocaleString()}`);
      if (pool1Logs.length > 0) {
        console.log(`📝 Sample event:`, {
          sender: pool1Logs[0].args.sender,
          amountIn: formatUnits(pool1Logs[0].args.amountIn, 6),
          amountOut: formatUnits(pool1Logs[0].args.amountOut, 6),
        });
      }
    } catch (e) {
      console.log('❌ Error:', e.message);
    }
    console.log('');

    // Test 2: Query USDC-USYC Pool Swap events
    console.log('--- Test 2: USDC-USYC Pool Swaps ---');
    try {
      const pool2Logs = await client.getLogs({
        address: CONTRACTS.USDC_USYC_POOL,
        event: SWAP_EVENT,
        fromBlock: 0n,
        toBlock: currentBlock,
      });
      
      let pool2Volume = 0;
      pool2Logs.forEach((log) => {
        const amountIn = log.args.amountIn;
        if (amountIn) {
          pool2Volume += Number(formatUnits(amountIn, 6));
        }
      });
      
      console.log(`✅ Found ${pool2Logs.length} swap events`);
      console.log(`💰 Total Volume: $${pool2Volume.toLocaleString()}`);
    } catch (e) {
      console.log('❌ Error:', e.message);
    }
    console.log('');

    // Test 3: Query Circle TokenMessenger Bridge events
    console.log('--- Test 3: Circle CCTP Bridge (DepositForBurn) ---');
    try {
      const bridgeLogs = await client.getLogs({
        address: CONTRACTS.TOKEN_MESSENGER,
        event: DEPOSIT_FOR_BURN_EVENT,
        fromBlock: 0n,
        toBlock: currentBlock,
      });
      
      let bridgeVolume = 0;
      bridgeLogs.forEach((log) => {
        const amount = log.args.amount;
        if (amount) {
          bridgeVolume += Number(formatUnits(amount, 6));
        }
      });
      
      console.log(`✅ Found ${bridgeLogs.length} bridge events`);
      console.log(`💰 Total Volume: $${bridgeVolume.toLocaleString()}`);
      if (bridgeLogs.length > 0) {
        console.log(`📝 Sample event:`, {
          depositor: bridgeLogs[0].args.depositor,
          amount: formatUnits(bridgeLogs[0].args.amount, 6),
          destinationDomain: bridgeLogs[0].args.destinationDomain,
        });
      }
    } catch (e) {
      console.log('❌ Error:', e.message);
    }
    console.log('');

    // Test 4: Check our Bridge contract stats
    console.log('--- Test 4: XyloBridge Contract Stats ---');
    try {
      const stats = await client.readContract({
        address: CONTRACTS.BRIDGE,
        abi: [{
          inputs: [],
          name: 'getStats',
          outputs: [
            { name: '_totalBridgedIn', type: 'uint256' },
            { name: '_totalBridgedOut', type: 'uint256' },
            { name: '_bridgeCount', type: 'uint256' },
          ],
          stateMutability: 'view',
          type: 'function',
        }],
        functionName: 'getStats',
      });
      
      console.log('✅ Contract Stats:');
      console.log(`   Total Bridged In: $${Number(formatUnits(stats[0], 6)).toLocaleString()}`);
      console.log(`   Total Bridged Out: $${Number(formatUnits(stats[1], 6)).toLocaleString()}`);
      console.log(`   Bridge Count: ${stats[2].toString()}`);
    } catch (e) {
      console.log('❌ Error:', e.message);
    }

  } catch (error) {
    console.error('Fatal Error:', error);
  }
}

testVolumeQueries();
