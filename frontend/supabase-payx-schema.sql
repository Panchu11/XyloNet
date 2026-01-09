-- ═══════════════════════════════════════════════════════════════════════════════
-- PAYX SUPABASE SCHEMA
-- Run this SQL in your Supabase SQL Editor to create PayX tables
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE: payx_users
-- Stores unique users (tippers and recipients)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payx_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE,
  x_handle TEXT UNIQUE,
  total_sent DECIMAL(20, 6) DEFAULT 0,
  total_received DECIMAL(20, 6) DEFAULT 0,
  tip_count INTEGER DEFAULT 0,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_payx_users_wallet ON payx_users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_payx_users_handle ON payx_users(x_handle);
CREATE INDEX IF NOT EXISTS idx_payx_users_last_active ON payx_users(last_active DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE: payx_tips
-- Indexed tip transactions from blockchain events
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payx_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tx_hash TEXT UNIQUE NOT NULL,
  from_address TEXT NOT NULL,
  to_handle TEXT NOT NULL,
  amount DECIMAL(20, 6) NOT NULL,
  fee DECIMAL(20, 6) DEFAULT 0,
  message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  block_number BIGINT NOT NULL,
  indexed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_payx_tips_timestamp ON payx_tips(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_payx_tips_from ON payx_tips(from_address);
CREATE INDEX IF NOT EXISTS idx_payx_tips_to ON payx_tips(to_handle);
CREATE INDEX IF NOT EXISTS idx_payx_tips_block ON payx_tips(block_number DESC);
CREATE INDEX IF NOT EXISTS idx_payx_tips_amount ON payx_tips(amount DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE: payx_claims
-- Track tip claims (when users withdraw their tips)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payx_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tx_hash TEXT UNIQUE NOT NULL,
  x_handle TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  amount DECIMAL(20, 6) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  block_number BIGINT NOT NULL,
  indexed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payx_claims_handle ON payx_claims(x_handle);
CREATE INDEX IF NOT EXISTS idx_payx_claims_wallet ON payx_claims(wallet_address);
CREATE INDEX IF NOT EXISTS idx_payx_claims_timestamp ON payx_claims(timestamp DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE: payx_stats_cache
-- Cached aggregate statistics (updated periodically)
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payx_stats_cache (
  id TEXT PRIMARY KEY DEFAULT 'global',
  total_volume DECIMAL(20, 6) DEFAULT 0,
  total_tips INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  unique_tippers INTEGER DEFAULT 0,
  unique_recipients INTEGER DEFAULT 0,
  volume_24h DECIMAL(20, 6) DEFAULT 0,
  tips_24h INTEGER DEFAULT 0,
  avg_tip DECIMAL(20, 6) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial stats row
INSERT INTO payx_stats_cache (id) VALUES ('global') ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTION: Update user stats after tip insert
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_payx_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or create tipper record
  INSERT INTO payx_users (wallet_address, total_sent, tip_count, last_active)
  VALUES (LOWER(NEW.from_address), NEW.amount, 1, NOW())
  ON CONFLICT (wallet_address) DO UPDATE SET
    total_sent = payx_users.total_sent + NEW.amount,
    tip_count = payx_users.tip_count + 1,
    last_active = NOW();

  -- Update or create recipient record
  INSERT INTO payx_users (x_handle, total_received, last_active)
  VALUES (LOWER(NEW.to_handle), NEW.amount, NOW())
  ON CONFLICT (x_handle) DO UPDATE SET
    total_received = payx_users.total_received + NEW.amount,
    last_active = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update user stats on new tip
DROP TRIGGER IF EXISTS trigger_update_payx_user_stats ON payx_tips;
CREATE TRIGGER trigger_update_payx_user_stats
  AFTER INSERT ON payx_tips
  FOR EACH ROW
  EXECUTE FUNCTION update_payx_user_stats();

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTION: Refresh stats cache
-- Call this periodically via cron or API
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION refresh_payx_stats_cache()
RETURNS void AS $$
DECLARE
  v_total_volume DECIMAL(20, 6);
  v_total_tips INTEGER;
  v_volume_24h DECIMAL(20, 6);
  v_tips_24h INTEGER;
  v_unique_tippers INTEGER;
  v_unique_recipients INTEGER;
  v_total_users INTEGER;
BEGIN
  -- Calculate totals
  SELECT 
    COALESCE(SUM(amount), 0),
    COUNT(*)
  INTO v_total_volume, v_total_tips
  FROM payx_tips;

  -- Calculate 24h stats
  SELECT 
    COALESCE(SUM(amount), 0),
    COUNT(*)
  INTO v_volume_24h, v_tips_24h
  FROM payx_tips
  WHERE timestamp >= NOW() - INTERVAL '24 hours';

  -- Count unique tippers and recipients
  SELECT COUNT(DISTINCT from_address) INTO v_unique_tippers FROM payx_tips;
  SELECT COUNT(DISTINCT to_handle) INTO v_unique_recipients FROM payx_tips;
  
  -- Total users
  SELECT COUNT(*) INTO v_total_users FROM payx_users;

  -- Update cache
  UPDATE payx_stats_cache SET
    total_volume = v_total_volume,
    total_tips = v_total_tips,
    total_users = v_total_users,
    unique_tippers = v_unique_tippers,
    unique_recipients = v_unique_recipients,
    volume_24h = v_volume_24h,
    tips_24h = v_tips_24h,
    avg_tip = CASE WHEN v_total_tips > 0 THEN v_total_volume / v_total_tips ELSE 0 END,
    updated_at = NOW()
  WHERE id = 'global';
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- Enable read access for anonymous users, write access for authenticated
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE payx_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payx_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE payx_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE payx_stats_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read on payx_users" ON payx_users
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on payx_tips" ON payx_tips
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on payx_claims" ON payx_claims
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on payx_stats_cache" ON payx_stats_cache
  FOR SELECT USING (true);

-- Allow service role full access (for indexer)
CREATE POLICY "Allow service role insert on payx_users" ON payx_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role update on payx_users" ON payx_users
  FOR UPDATE USING (true);

CREATE POLICY "Allow service role insert on payx_tips" ON payx_tips
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role insert on payx_claims" ON payx_claims
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role all on payx_stats_cache" ON payx_stats_cache
  FOR ALL USING (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE! Run this SQL in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════
