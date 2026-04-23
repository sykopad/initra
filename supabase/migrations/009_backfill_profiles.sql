-- =============================================
-- Migration: Backfill Profiles
-- Goal: Ensure all auth.users have an initra.profiles entry
-- =============================================

-- 1. Backfill missing profiles
INSERT INTO initra.profiles (id, display_name, created_at, updated_at)
SELECT 
  id, 
  COALESCE(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', 'User'),
  created_at,
  COALESCE(last_sign_in_at, created_at)
FROM auth.users
WHERE id NOT IN (SELECT id FROM initra.profiles)
ON CONFLICT (id) DO NOTHING;

-- 2. Ensure trigger exists and is correct
CREATE OR REPLACE FUNCTION initra.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO initra.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initra.handle_new_user();

-- 3. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
