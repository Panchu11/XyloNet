/**
 * Reset PayX Supabase tables for new contract deployment
 * Run: node scripts/reset-payx-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_KEY ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function resetPayXTables() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║       PayX Supabase Reset - New Contract Deployment       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  console.log('📍 Supabase URL:', SUPABASE_URL);
  console.log('📍 New Contract: 0xA312c384770B7b49E371DF4b7AF730EFEF465913');
  console.log('📍 USDC: 0x3600000000000000000000000000000000000000 (6 decimals)\n');

  try {
    // 1. Clear payx_tips table
    console.log('🗑️  Clearing payx_tips...');
    const { error: tipsError, count: tipsCount } = await supabase
      .from('payx_tips')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (workaround)
    
    if (tipsError) {
      console.log('   ⚠️  Error:', tipsError.message);
    } else {
      console.log('   ✅ Cleared payx_tips');
    }

    // 2. Clear payx_users table  
    console.log('🗑️  Clearing payx_users...');
    const { error: usersError } = await supabase
      .from('payx_users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (usersError) {
      console.log('   ⚠️  Error:', usersError.message);
    } else {
      console.log('   ✅ Cleared payx_users');
    }

    // 3. Clear payx_claims table
    console.log('🗑️  Clearing payx_claims...');
    const { error: claimsError } = await supabase
      .from('payx_claims')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (claimsError) {
      console.log('   ⚠️  Error:', claimsError.message);
    } else {
      console.log('   ✅ Cleared payx_claims');
    }

    // 4. Reset payx_stats_cache
    console.log('🔄 Resetting payx_stats_cache...');
    const { error: statsError } = await supabase
      .from('payx_stats_cache')
      .update({
        total_volume: 0,
        total_tips: 0,
        total_users: 0,
        unique_tippers: 0,
        unique_recipients: 0,
        volume_24h: 0,
        tips_24h: 0,
        avg_tip: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', 'global');
    
    if (statsError) {
      console.log('   ⚠️  Error:', statsError.message);
    } else {
      console.log('   ✅ Reset payx_stats_cache');
    }

    // Verify tables are empty
    console.log('\n📊 Verification:');
    
    const { count: tips } = await supabase
      .from('payx_tips')
      .select('*', { count: 'exact', head: true });
    console.log('   payx_tips:', tips || 0, 'rows');

    const { count: users } = await supabase
      .from('payx_users')
      .select('*', { count: 'exact', head: true });
    console.log('   payx_users:', users || 0, 'rows');

    const { count: claims } = await supabase
      .from('payx_claims')
      .select('*', { count: 'exact', head: true });
    console.log('   payx_claims:', claims || 0, 'rows');

    const { data: statsData } = await supabase
      .from('payx_stats_cache')
      .select('*')
      .eq('id', 'global')
      .single();
    console.log('   payx_stats_cache:', statsData ? `volume=${statsData.total_volume}, tips=${statsData.total_tips}` : 'N/A');

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                   RESET COMPLETE                          ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n✅ PayX Supabase tables are now ready for the new contract!');
    console.log('🔗 New tips will be indexed from block 20843000');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPayXTables();
