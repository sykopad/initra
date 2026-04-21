-- =============================================
-- Migration: Welcome Bonus Credits
-- Goal: Grant 100 free credits to new users and update existing users
-- =============================================

-- 1. Ensure credits column exists and has default 100
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'initra' AND table_name = 'profiles' AND column_name = 'credits') THEN
        ALTER TABLE initra.profiles ADD COLUMN credits INTEGER DEFAULT 100;
    ELSE
        ALTER TABLE initra.profiles ALTER COLUMN credits SET DEFAULT 100;
    END IF;
END $$;

-- 2. Update the trigger function for new users
CREATE OR REPLACE FUNCTION initra.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO initra.profiles (id, display_name, avatar_url, credits)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    100 -- Welcome Bonus
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant 100 credits to any existing user who has 0 or NULL (Welcome legacy users)
UPDATE initra.profiles 
SET credits = 100 
WHERE credits IS NULL OR credits = 0;
