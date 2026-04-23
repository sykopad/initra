-- =============================================
-- Migration: Synced Repos Unique Constraint
-- Goal: Fix upsert conflict target error
-- =============================================

-- Add unique constraint to synced_repositories
-- This allows the .upsert({ ... }, { onConflict: 'owner,repo_name' }) call to work
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'synced_repositories_owner_repo_name_key'
  ) THEN
    ALTER TABLE initra.synced_repositories 
    ADD CONSTRAINT synced_repositories_owner_repo_name_key UNIQUE (owner, repo_name);
  END IF;
END $$;

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
