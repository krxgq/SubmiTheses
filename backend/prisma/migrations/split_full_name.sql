-- Migration: Split full_name into first_name and last_name
-- This migration splits the full_name field into separate first_name and last_name fields

-- Step 1: Add new columns
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS first_name VARCHAR,
ADD COLUMN IF NOT EXISTS last_name VARCHAR;

-- Step 2: Migrate existing data (split on first space)
-- If full_name is "John Doe", first_name becomes "John", last_name becomes "Doe"
-- If full_name is "John", first_name becomes "John", last_name becomes NULL
UPDATE public.users
SET
  first_name = CASE
    WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0
    THEN substring(full_name from 1 for position(' ' in full_name) - 1)
    ELSE full_name
  END,
  last_name = CASE
    WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0
    THEN substring(full_name from position(' ' in full_name) + 1)
    ELSE NULL
  END
WHERE full_name IS NOT NULL;

-- Step 3: Drop dependent views
DROP VIEW IF EXISTS user_profiles;

-- Step 4: Drop old full_name column
ALTER TABLE public.users
DROP COLUMN IF EXISTS full_name;

-- Step 5: Recreate user_profiles view with new fields
CREATE OR REPLACE VIEW user_profiles AS
SELECT
    u.id,
    u.role,
    u.first_name,
    u.last_name,
    u.email,
    u.avatar_url,
    u.year_id,
    u.created_at,
    u.updated_at
FROM users u;

-- Note: first_name and last_name are nullable to allow flexibility
