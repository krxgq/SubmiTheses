-- Migration: Add JWT claims synchronization
-- This ensures user roles are automatically included in JWT tokens

-- Create function to update JWT claims with role from public.users
CREATE OR REPLACE FUNCTION update_user_jwt_claims()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auth.users raw_app_meta_data with role from public.users
  UPDATE auth.users 
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
                          jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on public.users for role changes
DROP TRIGGER IF EXISTS sync_jwt_claims_on_role_change ON public.users;
CREATE TRIGGER sync_jwt_claims_on_role_change
  AFTER INSERT OR UPDATE OF role ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_jwt_claims();

-- Update existing users' JWT claims with their current roles
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
                        jsonb_build_object('role', pu.role)
FROM public.users pu 
WHERE auth.users.id = pu.id;