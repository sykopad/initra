-- =============================================
-- Migration: Synced Repos Unique Constraint
-- Goal: Fix upsert conflict target error
-- =============================================

-- Add unique constraint to synced_repositories
-- This allows the .upsert({ ... }, { onConflict: 'owner,repo_name' }) call to work
ALTER TABLE initra.synced_repositories 
ADD CONSTRAINT synced_repositories_owner_repo_name_key UNIQUE (owner, repo_name);

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
