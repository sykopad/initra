-- =============================================
-- Migration: Community Suggestions
-- Goal: Add suggestion_type to community_projects
-- =============================================

ALTER TABLE initra.community_projects 
ADD COLUMN IF NOT EXISTS suggestion_type TEXT DEFAULT 'project' 
CHECK (suggestion_type IN ('initra', 'project'));
