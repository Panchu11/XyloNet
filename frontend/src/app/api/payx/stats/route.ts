import { NextRequest, NextResponse } from 'next/server';
import { ethers, EventLog } from 'ethers';
import { PayXTippingABI, PAYX_CONTRACT_ADDRESS, PAYX_DEPLOYMENT_BLOCK } from '@/config/abis/PayXTipping';
import { getPayXStats, bulkIndexTips, getLastIndexedBlock, syncUsersFromTips } from '@/lib/payx-supabase';

// Arc Testnet RPC
const RPC_URL = process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network';

/**
 * GET /api/payx/stats
 * Returns real-time PayX statistics from blockchain events + Supabase
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'supabase'; // 'supabase' or 'blockchain'

    // If source is supabase, return cached stats
    if (source === 'supabase') {
      const stats = await getPayXStats();
      return NextResponse.json({
        success: true,
        data: stats,
        source: 'supabase',
      });
    }

    // Otherwise, fetch directly from blockchain
    console.log('[PayX Stats] Fetching from blockchain...');
    console.log('[PayX Stats] RPC URL:', RPC_URL);
    console.log('[PayX Stats] Contract:', PAYX_CONTRACT_ADDRESS);
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(PAYX_CONTRACT_ADDRESS, PayXTippingABI, provider);

    // Get current block
    const currentBlock = await provider.getBlockNumber();
    console.log('[PayX Stats] Current block:', currentBlock);
    
    // Arc RPC limits eth_getLogs to 10,000 blocks max
    const fromBlock = Math.max(0, currentBlock - 10000);
    console.log('[PayX Stats] Fetching from block:', fromBlock);

    // Fetch TipSent events
    const tipSentFilter = contract.filters.TipSent();
    const events = await contract.queryFilter(tipSentFilter, fromBlock, currentBlock);
    console.log('[PayX Stats] Found events:', events.length);

    // Calculate stats
    let totalVolume = BigInt(0);
    let volume24h = BigInt(0);
    let tips24h = 0;
    const uniqueTippers = new Set<string>();
    const uniqueRecipients = new Set<string>();

    const now = Math.floor(Date.now() / 1000);
    const yesterday = now - 24 * 60 * 60;

    for (const event of events) {
      // Type guard for EventLog
      if (!('args' in event)) {
        console.log('[PayX Stats] Event has no args, skipping');
        continue;
      }
      const eventLog = event as EventLog;
      const args = eventLog.args;
      if (!args) {
        console.log('[PayX Stats] Args is null, skipping');
        continue;
      }

      try {
        const amount = args.amount as bigint;
        const timestamp = Number(args.timestamp);
        const tipper = args.tipper as string;
        const handle = args.handle as string;

        console.log('[PayX Stats] Processing tip:', { amount: amount.toString(), tipper, handle, timestamp });

        totalVolume += amount;
        uniqueTippers.add(tipper.toLowerCase());
        uniqueRecipients.add(handle.toLowerCase());

        if (timestamp >= yesterday) {
          volume24h += amount;
          tips24h++;
        }
      } catch (eventErr) {
        console.error('[PayX Stats] Error processing event:', eventErr);
      }
    }

    const totalTips = events.length;
    const avgTip = totalTips > 0 ? totalVolume / BigInt(totalTips) : BigInt(0);

    // Format amounts - Real Circle USDC uses 6 decimals
    const formatAmount = (amount: bigint) => Number(ethers.formatUnits(amount, 6));

    const stats = {
      total_volume: formatAmount(totalVolume),
      total_tips: totalTips,
      total_users: uniqueTippers.size + uniqueRecipients.size,
      unique_tippers: uniqueTippers.size,
      unique_recipients: uniqueRecipients.size,
      volume_24h: formatAmount(volume24h),
      tips_24h: tips24h,
      avg_tip: formatAmount(avgTip),
      current_block: currentBlock,
      events_fetched: events.length,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: stats,
      source: 'blockchain',
    });
  } catch (error: any) {
    console.error('[PayX Stats API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch stats',
        // Return fallback zero stats
        data: {
          total_volume: 0,
          total_tips: 0,
          total_users: 0,
          unique_tippers: 0,
          unique_recipients: 0,
          volume_24h: 0,
          tips_24h: 0,
          avg_tip: 0,
          updated_at: new Date().toISOString(),
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payx/stats
 * Sync blockchain events to Supabase (indexer endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Sync users from existing tips (repair function)
    if (action === 'sync-users') {
      const result = await syncUsersFromTips();
      return NextResponse.json({
        success: true,
        message: `Synced ${result.tippers} tippers and ${result.recipients} recipients`,
        ...result,
      });
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(PAYX_CONTRACT_ADDRESS, PayXTippingABI, provider);

    // Get last indexed block from Supabase
    const lastIndexedBlock = await getLastIndexedBlock();
    const currentBlock = await provider.getBlockNumber();
    
    // Start from last indexed block + 1, but limit to 10k block range (RPC limit)
    let fromBlock = lastIndexedBlock > 0 ? lastIndexedBlock + 1 : Math.max(0, currentBlock - 10000);
    
    // Ensure we don't exceed 10k block range
    if (currentBlock - fromBlock > 10000) {
      fromBlock = currentBlock - 10000;
    }

    if (fromBlock > currentBlock) {
      return NextResponse.json({
        success: true,
        message: 'Already up to date',
        indexed: 0,
        lastBlock: lastIndexedBlock,
      });
    }

    // Fetch TipSent events
    const tipSentFilter = contract.filters.TipSent();
    const events = await contract.queryFilter(tipSentFilter, fromBlock, currentBlock);

    if (events.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new events to index',
        indexed: 0,
        fromBlock,
        toBlock: currentBlock,
      });
    }

    // Transform events for Supabase
    const tips = events
      .filter((event): event is EventLog => 'args' in event)
      .map(event => {
        const args = event.args;
        return {
          tx_hash: event.transactionHash,
          from_address: args?.tipper as string,
          to_handle: args?.handle as string,
          amount: Number(ethers.formatUnits(args?.amount || 0, 6)), // Real USDC uses 6 decimals
          fee: Number(ethers.formatUnits(args?.fee || 0, 6)),
          message: args?.message as string || null,
          timestamp: new Date(Number(args?.timestamp || 0) * 1000).toISOString(),
          block_number: event.blockNumber,
        };
      });

    // Bulk index to Supabase
    const indexed = await bulkIndexTips(tips);

    return NextResponse.json({
      success: true,
      message: `Indexed ${indexed} tips`,
      indexed,
      fromBlock,
      toBlock: currentBlock,
      eventsFound: events.length,
    });
  } catch (error: any) {
    console.error('[PayX Indexer API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Indexing failed' },
      { status: 500 }
    );
  }
}
