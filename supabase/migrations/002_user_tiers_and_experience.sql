-- =============================================
-- Initra — User Tiers and Experience Levels
-- Adds columns to profiles and wizard_sessions
-- =============================================

-- Add tier and donation tracking to profiles
ALTER TABLE initra.profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'community' CHECK (tier IN ('community', 'pro', 'elite'));
ALTER TABLE initra.profiles ADD COLUMN IF NOT EXISTS donation_total DECIMAL DEFAULT 0;

-- Add experience level to sessions for tailored output
ALTER TABLE initra.wizard_sessions ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'experienced' CHECK (experience_level IN ('beginner', 'experienced'));

-- Comment on columns for documentation
COMMENT ON COLUMN initra.profiles.tier IS 'User tier: community (free), pro (logged in), elite (donator)';
COMMENT ON COLUMN initra.wizard_sessions.experience_level IS 'Customizes instructions for devs vs non-devs';
