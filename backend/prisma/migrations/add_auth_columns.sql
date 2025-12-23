-- Migration: Add authentication columns to users table
-- Description: Adds password hash and auth-related columns for custom authentication system
-- Date: 2025-12-23

BEGIN;

-- Add authentication columns to users table
ALTER TABLE public.users
  ADD COLUMN password_hash VARCHAR NOT NULL DEFAULT '',
  ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN email_verified_at TIMESTAMPTZ,
  ADD COLUMN password_reset_token VARCHAR,
  ADD COLUMN password_reset_expires TIMESTAMPTZ,
  ADD COLUMN last_login TIMESTAMPTZ;

-- Create index on password_reset_token for faster lookups during password reset
CREATE INDEX idx_users_password_reset_token ON public.users(password_reset_token) WHERE password_reset_token IS NOT NULL;

-- Create index on email_verified for filtering verified users
CREATE INDEX idx_users_email_verified ON public.users(email_verified);

-- Add comment to document the password_hash column
COMMENT ON COLUMN public.users.password_hash IS 'Bcrypt hashed password (cost factor 10)';

-- Add comment to document password reset functionality
COMMENT ON COLUMN public.users.password_reset_token IS 'Token for password reset flow, should expire after use';
COMMENT ON COLUMN public.users.password_reset_expires IS 'Expiration timestamp for password reset token';

COMMIT;
