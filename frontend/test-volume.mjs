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
    
    const CHUNK_SIZE = 10000n;
    const DEPLOYMENT_BLOCK = 19900000n; // Contract deployment block
    const fromBlock = DEPLOYMENT_BLOCK;
    console.log('📊 Query Range: Block', fromBlock.toString(), 'to', currentBlock.toString());
    console.log('   (ALL TIME - since contract deployment)\n');

    // Test 1: Query USDC-EURC Pool Swap events IN CHUNKS
    console.log('--- Test 1: USDC-EURC Pool Swaps (Chunked) ---');
    try {
      let pool1Volume = 0;
      let totalEvents = 0;
      
      for (let start = fromBlock; start < currentBlock; start += CHUNK_SIZE) {
        const end = start + CHUNK_SIZE > currentBlock ? currentBlock : start + CHUNK_SIZE;
        
        const logs = await client.getLogs({
          address: CONTRACTS.USDC_EURC_POOL,
          event: SWAP_EVENT,
          fromBlock: start,
          toBlock: end,
        });
        
        logs.forEach((log) => {
          const amountIn = log.args.amountIn;
          if (amountIn) {
            pool1Volume += Number(formatUnits(amountIn, 6));
          }
        });
        totalEvents += logs.length;
      }
      
      console.log(`✅ Found ${totalEvents} swap events`);
      console.log(`💰 Total Volume: $${pool1Volume.toLocaleString()}`);
    } catch (e) {
      console.log('❌ Error:', e.message);
    }
    console.log('');

    // Test 2: Query USDC-USYC Pool Swap events IN CHUNKS
    console.log('--- Test 2: USDC-USYC Pool Swaps (Chunked) ---');
    try {
      let pool2Volume = 0;
      let totalEvents = 0;
      
      for (let start = fromBlock; start < currentBlock; start += CHUNK_SIZE) {
        const end = start + CHUNK_SIZE > currentBlock ? currentBlock : start + CHUNK_SIZE;
        
        const logs = await client.getLogs({
          address: CONTRACTS.USDC_USYC_POOL,
          event: SWAP_EVENT,
          fromBlock: start,
          toBlock: end,
        });
        
        logs.forEach((log) => {
          const amountIn = log.args.amountIn;
          if (amountIn) {
            pool2Volume += Number(formatUnits(amountIn, 6));
          }
        });
        totalEvents += logs.length;
      }
      
      console.log(`✅ Found ${totalEvents} swap events`);
      console.log(`💰 Total Volume: $${pool2Volume.toLocaleString()}`);
    } catch (e) {
      console.log('❌ Error:', e.message);
    }
    console.log('');

    // Test 3: Query Circle TokenMessenger Bridge events IN CHUNKS
    console.log('--- Test 3: Circle CCTP Bridge (DepositForBurn) IN CHUNKS ---');
    try {
      let bridgeVolume = 0;
      let totalEvents = 0;
      
      for (let start = fromBlock; start < currentBlock; start += CHUNK_SIZE) {
        const end = start + CHUNK_SIZE > currentBlock ? currentBlock : start + CHUNK_SIZE;
        
        const logs = await client.getLogs({
          address: CONTRACTS.TOKEN_MESSENGER,
          event: DEPOSIT_FOR_BURN_EVENT,
          fromBlock: start,
          toBlock: end,
        });
        
        logs.forEach((log) => {
          const amount = log.args.amount;
          if (amount) {
            bridgeVolume += Number(formatUnits(amount, 6));
          }
        });
        totalEvents += logs.length;
        
        if (logs.length > 0) {
          console.log(`  Chunk ${start}-${end}: ${logs.length} events`);
        }
      }
      
      console.log(`✅ Found ${totalEvents} bridge events`);
      console.log(`💰 Total Volume: $${bridgeVolume.toLocaleString()}`);
      
      if (totalEvents === 0) {
        console.log('⚠️  No bridge events found in the last 100k blocks');
        console.log('   This likely means no one has bridged FROM Arc yet.');
        console.log('   Bridge events only show OUTGOING bridges (Arc → Other chains)');
      }
    } catch (e) {
      console.log('❌ Error:', e.message);
      console.log('   Full error:', e);
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
    console.log('');
    
    console.log('='.repeat(60));
    console.log('SUMMARY:');
    console.log('If swap volume shows but bridge = $0, it means:');
    console.log('1. No one has bridged FROM Arc in the last 100k blocks');
    console.log('2. DepositForBurn only tracks OUTGOING bridges');
    console.log('3. Users might be bridging TO Arc (not tracked by this event)');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Fatal Error:', error);
  }
}

testVolumeQueries();
