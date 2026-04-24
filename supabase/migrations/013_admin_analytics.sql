-- Initra — Admin Analytics & Hosting Tracking
-- Tracks which projects are running on managed vs sovereign infrastructure.

ALTER TABLE initra.community_projects 
ADD COLUMN IF NOT EXISTS hatch_mode TEXT DEFAULT 'sovereign';

-- Update existing projects to sovereign as a safe default
UPDATE initra.community_projects SET hatch_mode = 'sovereign' WHERE hatch_mode IS NULL;

-- Create an admin role/check if needed, but for now we'll use a special flag in profiles
ALTER TABLE initra.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
