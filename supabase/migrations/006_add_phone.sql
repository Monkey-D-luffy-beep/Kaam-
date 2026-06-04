-- Add phone number to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Index for phone lookups (follow-up calls, outreach)
CREATE INDEX IF NOT EXISTS profiles_phone_idx ON profiles(phone) WHERE phone IS NOT NULL;
