import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Fetch leaderboard with pagination
    const { data, error } = await supabase
      .from('users')
      .select('wallet_address, total_points')
      .order('total_points', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return Response.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
    
    // Add ranks to the results
    const leaderboardWithRanks = (data || []).map((entry, index) => ({
      ...entry,
      rank: offset + index + 1,
    }));
    
    // Get total user count for metadata
    const { count: totalUsers, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    return Response.json({
      entries: leaderboardWithRanks,
      totalUsers: totalUsers || 0,
      offset,
      limit,
    });
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
