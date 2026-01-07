// =====================================================
// XYLONET SUPABASE SETUP - COMPLETE SQL SCRIPT
// =====================================================
// 
// IMPORTANT: Running this script is SAFE!
// - Uses INSERT ... ON CONFLICT DO NOTHING
// - Will NOT delete or overwrite existing data
// - Will NOT duplicate tasks
// - User completions and leaderboard data will be preserved
//
// HOW TO USE:
// 1. Go to Supabase Dashboard > SQL Editor
// 2. Paste the SQL below
// 3. Click "Run"
// =====================================================

const FULL_SQL = `
-- =====================================================
-- XYLONET CAMPAIGN TASKS - COMPLETE SETUP
-- =====================================================
-- Safe to run multiple times - won't duplicate or lose data
-- =====================================================

-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  task_type VARCHAR(50) NOT NULL,
  action_url TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(100) UNIQUE NOT NULL,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_completions table if it doesn't exist
CREATE TABLE IF NOT EXISTS task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- =====================================================
-- INSERT ALL 4 TASKS (Safe - won't duplicate)
-- =====================================================

-- Task 1: Follow Twitter
INSERT INTO tasks (name, description, task_type, action_url, points, is_active)
VALUES ('follow_twitter', 'Follow @Xylonet_ on X', 'social', 'https://x.com/Xylonet_', 50, true)
ON CONFLICT (name) DO NOTHING;

-- Task 2: Like Tweet  
INSERT INTO tasks (name, description, task_type, action_url, points, is_active)
VALUES ('like_tweet', 'Like the announcement tweet', 'social', 'https://x.com/Xylonet_/status/2007058463311253538', 25, true)
ON CONFLICT (name) DO NOTHING;

-- Task 3: Retweet
INSERT INTO tasks (name, description, task_type, action_url, points, is_active)
VALUES ('retweet', 'Retweet the announcement', 'social', 'https://x.com/Xylonet_/status/2007058463311253538', 25, true)
ON CONFLICT (name) DO NOTHING;

-- Task 4: Join Discord (NEW!)
INSERT INTO tasks (name, description, task_type, action_url, points, is_active)
VALUES ('join_discord', 'Join XyloNet Discord Community', 'social', 'https://discord.gg/4aXEm78a', 50, true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- VERIFY: Show all tasks
-- =====================================================
SELECT name, description, points, is_active FROM tasks ORDER BY created_at;
`;

console.log('=====================================================');
console.log('XYLONET SUPABASE SETUP - COMPLETE SQL SCRIPT');
console.log('=====================================================');
console.log('');
console.log('⚠️  IMPORTANT: This script is SAFE to run multiple times!');
console.log('   - Uses INSERT ... ON CONFLICT DO NOTHING');
console.log('   - Will NOT delete existing data');
console.log('   - Will NOT duplicate tasks');
console.log('   - User completions are preserved');
console.log('');
console.log('📋 HOW TO USE:');
console.log('   1. Go to Supabase Dashboard');
console.log('   2. Click "SQL Editor" in the left sidebar');
console.log('   3. Click "+ New query"');
console.log('   4. Paste the SQL below');
console.log('   5. Click "Run"');
console.log('');
console.log('=====================================================');
console.log('COPY THIS SQL:');
console.log('=====================================================');
console.log(FULL_SQL);
