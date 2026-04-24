-- Initra — Sovereign Infrastructure Config
-- Allows users to bring their own Vercel/GitHub tokens for true infrastructure ownership.

ALTER TABLE initra.profiles 
ADD COLUMN IF NOT EXISTS vercel_token TEXT,
ADD COLUMN IF NOT EXISTS vercel_team_id TEXT,
ADD COLUMN IF NOT EXISTS github_personal_token TEXT;

-- Ensure these columns are ONLY readable by the owner
-- Profiles table should already have RLS, but we'll reinforce it.

DROP POLICY IF EXISTS "Users can view their own profile" ON initra.profiles;
CREATE POLICY "Users can view their own profile" 
    ON initra.profiles FOR SELECT 
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON initra.profiles;
CREATE POLICY "Users can update their own profile" 
    ON initra.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Note: We do NOT encrypt at the DB level here as Supabase Vault is better for that,
-- but standard RLS ensures other users cannot query these tokens.
