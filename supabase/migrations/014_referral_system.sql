-- Initra — Referral System
-- Rewards users for inviting new Sovereign or Pro builders.

ALTER TABLE initra.profiles 
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Generate random referral codes for existing users
UPDATE initra.profiles 
SET referral_code = LOWER(SUBSTRING(id::TEXT, 1, 8))
WHERE referral_code IS NULL;
