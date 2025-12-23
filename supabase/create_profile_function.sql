-- =====================================================
-- Create Profile Function - Standalone Script
-- =====================================================
-- Run this if the function doesn't exist or schema cache is stale
-- =====================================================

-- Drop function if exists (to recreate with correct signature)
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT);

-- Create the function with explicit parameter names
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_phone TEXT
)
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referral_code TEXT;
BEGIN
  -- Generate unique referral code
  referral_code := public.generate_referral_code();
  
  -- Insert profile (SECURITY DEFINER bypasses RLS)
  INSERT INTO public.profiles (
    id,
    email,
    name,
    phone,
    referral_code,
    referral_count,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_email,
    user_name,
    user_phone,
    referral_code,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN referral_code;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- Verify function was created
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'create_user_profile';

