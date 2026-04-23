-- =============================================
-- Migration: Synced Repos RLS Fixes
-- Goal: Allow users to manage their own repo data
-- =============================================

-- 1. Synced Repositories RLS
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'synced_repositories' AND policyname = 'Users can insert own synced repos'
  ) THEN
    CREATE POLICY "Users can insert own synced repos" ON initra.synced_repositories FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'synced_repositories' AND policyname = 'Users can update own synced repos'
  ) THEN
    CREATE POLICY "Users can update own synced repos" ON initra.synced_repositories FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2. Repo Segments RLS
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'repo_segments' AND policyname = 'Users can manage own repo segments'
  ) THEN
    CREATE POLICY "Users can manage own repo segments" ON initra.repo_segments FOR ALL USING (
      EXISTS (
        SELECT 1 FROM initra.synced_repositories sr
        WHERE sr.id = repo_id
        AND sr.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 3. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
