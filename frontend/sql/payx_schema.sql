-- ═══════════════════════════════════════════════════════════════════════════
-- PayX Supabase Schema
-- 
-- Run this SQL in your Supabase SQL Editor to create the PayX tables
-- This uses the same Supabase project as XyloNet
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: payx_users
-- Tracks unique tippers and recipients in the PayX system
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payx_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_address TEXT UNIQUE,
  x_handle TEXT UNIQUE,
  total_sent DECIMAL(20, 6) DEFAULT 0,
  total_received DECIMAL(20, 6) DEFAULT 0,
  tip_count INTEGER DEFAULT 0,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_payx_users_wallet ON payx_users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_payx_users_handle ON payx_users(x_handle);
CREATE INDEX IF NOT EXISTS idx_payx_users_last_active ON payx_users(last_active);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: payx_tips
-- Stores all indexed tip transactions from the blockchain
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payx_tips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tx_hash TEXT UNIQUE NOT NULL,
  from_address TEXT NOT NULL,
  to_handle TEXT NOT NULL,
  amount DECIMAL(20, 6) NOT NULL,
  fee DECIMAL(20, 6) DEFAULT 0,
  message TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  block_number BIGINT NOT NULL,
  indexed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_payx_tips_tx_hash ON payx_tips(tx_hash);
CREATE INDEX IF NOT EXISTS idx_payx_tips_from ON payx_tips(from_address);
CREATE INDEX IF NOT EXISTS idx_payx_tips_to ON payx_tips(to_handle);
CREATE INDEX IF NOT EXISTS idx_payx_tips_timestamp ON payx_tips(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_payx_tips_block ON payx_tips(block_number DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: payx_stats_cache (Optional - for performance)
-- Caches aggregate statistics to reduce computation on every request
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payx_stats_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stat_key TEXT UNIQUE NOT NULL,
  stat_value DECIMAL(20, 6) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE payx_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payx_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE payx_stats_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anonymous users can view stats)
CREATE POLICY "Allow public read on payx_users" 
  ON payx_users FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read on payx_tips" 
  ON payx_tips FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read on payx_stats_cache" 
  ON payx_stats_cache FOR SELECT 
  USING (true);

-- Allow service role full access (for indexer API)
CREATE POLICY "Allow service role full access on payx_users" 
  ON payx_users FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on payx_tips" 
  ON payx_tips FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on payx_stats_cache" 
  ON payx_stats_cache FOR ALL 
  USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTIONS: Aggregate Statistics
-- ═══════════════════════════════════════════════════════════════════════════

-- Function to get total volume
CREATE OR REPLACE FUNCTION get_payx_total_volume()
RETURNS DECIMAL AS $$
BEGIN
  RETURN COALESCE((SELECT SUM(amount) FROM payx_tips), 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get 24h stats
CREATE OR REPLACE FUNCTION get_payx_24h_stats()
RETURNS TABLE(volume_24h DECIMAL, tips_24h BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(amount), 0) as volume_24h,
    COUNT(*) as tips_24h
  FROM payx_tips
  WHERE timestamp > NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to get unique user counts
CREATE OR REPLACE FUNCTION get_payx_user_counts()
RETURNS TABLE(unique_tippers BIGINT, unique_recipients BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT from_address) as unique_tippers,
    COUNT(DISTINCT to_handle) as unique_recipients
  FROM payx_tips;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- SAMPLE DATA (Optional - for testing)
-- Uncomment to insert sample data
-- ═══════════════════════════════════════════════════════════════════════════

-- INSERT INTO payx_tips (tx_hash, from_address, to_handle, amount, fee, message, timestamp, block_number)
-- VALUES 
--   ('0x1234...', '0xtipper1...', 'elonmusk', 10.00, 0.10, 'Great tweet!', NOW() - INTERVAL '5 minutes', 1000),
--   ('0x2345...', '0xtipper2...', 'vitalik', 25.00, 0.25, 'Love ETH!', NOW() - INTERVAL '10 minutes', 999),
--   ('0x3456...', '0xtipper3...', 'naval', 50.00, 0.50, 'Wisdom!', NOW() - INTERVAL '15 minutes', 998);

-- ═══════════════════════════════════════════════════════════════════════════
-- NOTES
-- ═══════════════════════════════════════════════════════════════════════════
-- 
-- 1. Run this script in Supabase SQL Editor
-- 2. The indexer API (/api/payx/stats POST) syncs blockchain events to these tables
-- 3. Stats API (/api/payx/stats GET) reads from these tables
-- 4. Recent Tips API (/api/payx/recent-tips GET) fetches latest tips
-- 
-- For production, consider:
-- - Adding more indexes based on query patterns
-- - Setting up automatic stats caching via cron jobs
-- - Adding data retention policies
-- ═══════════════════════════════════════════════════════════════════════════
