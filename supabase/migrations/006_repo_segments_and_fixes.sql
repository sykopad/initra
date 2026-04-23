-- =============================================
-- Migration: Repo Segments & Fixes
-- Goal: Define repo_segments and ensure schema parity
-- =============================================

-- 1. Repo Segments Table
CREATE TABLE IF NOT EXISTS initra.repo_segments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  repo_id UUID NOT NULL REFERENCES initra.synced_repositories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_repo_segments_repo ON initra.repo_segments(repo_id);

-- 2. RLS for repo_segments
ALTER TABLE initra.repo_segments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'repo_segments' AND policyname = 'Users can view own repo segments'
  ) THEN
    CREATE POLICY "Users can view own repo segments" ON initra.repo_segments FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM initra.synced_repositories sr
        WHERE sr.id = repo_id
        AND sr.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 3. Grant Permissions (Ensures parity for all tables)
GRANT USAGE ON SCHEMA initra TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA initra TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA initra TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA initra TO anon;

-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
