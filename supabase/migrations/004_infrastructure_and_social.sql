-- =============================================
-- Migration: Infrastructure & Social Signals
-- Goal: Provision synced repos, credit logs, and social metrics
-- =============================================

-- 1. Synced Repositories
CREATE TABLE IF NOT EXISTS initra.synced_repositories (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES initra.profiles(id) ON DELETE CASCADE,
  owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  framework TEXT,
  last_synced_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_synced_repos_user ON initra.synced_repositories(user_id);

-- 2. Credit Transactions
CREATE TABLE IF NOT EXISTS initra.credit_transactions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES initra.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus', 'refund')),
  description TEXT,
  session_id UUID REFERENCES initra.wizard_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_credit_tx_user ON initra.credit_transactions(user_id);

-- 3. Community Enhancements
ALTER TABLE initra.community_projects ADD COLUMN IF NOT EXISTS venture_type TEXT DEFAULT 'user-suggested' CHECK (venture_type IN ('user-suggested', 'ai-generated'));
ALTER TABLE initra.community_projects ADD COLUMN IF NOT EXISTS fork_count INTEGER DEFAULT 0;
ALTER TABLE initra.community_projects ADD COLUMN IF NOT EXISTS trending_score DECIMAL DEFAULT 0;
ALTER TABLE initra.community_projects ADD COLUMN IF NOT EXISTS blueprint_config JSONB;

-- 4. Profile Enhancements
ALTER TABLE initra.profiles ADD COLUMN IF NOT EXISTS next_refill_at TIMESTAMPTZ;

-- Ensure RLS for new tables
ALTER TABLE initra.synced_repositories ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can view own synced repos" ON initra.synced_repositories FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can delete own synced repos" ON initra.synced_repositories FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE initra.credit_transactions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can view own transactions" ON initra.credit_transactions FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA initra TO authenticated;

-- 5. Helper Functions
CREATE OR REPLACE FUNCTION initra.increment_fork_count(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE initra.community_projects
  SET fork_count = fork_count + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
