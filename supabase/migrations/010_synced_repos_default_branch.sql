-- =============================================
-- Migration: Default Branch Support
-- Goal: Store and use the correct repo branch
-- =============================================

-- Add default_branch column to synced_repositories
ALTER TABLE initra.synced_repositories 
ADD COLUMN IF NOT EXISTS default_branch TEXT DEFAULT 'main';

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
