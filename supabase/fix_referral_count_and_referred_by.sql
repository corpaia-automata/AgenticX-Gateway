-- =====================================================
-- Fix Referral Count and referred_by Not Working
-- =====================================================
-- This script ensures:
-- 1. apply_referral function exists and works correctly
-- 2. RLS policies allow the function to update profiles
-- 3. The function can update both referred_by and referral_count
-- =====================================================

-- Step 1: Ensure apply_referral function exists and works
DROP FUNCTION IF EXISTS public.apply_referral(UUID, UUID);

CREATE OR REPLACE FUNCTION public.apply_referral(
  new_user_id UUID,
  referrer_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the new user's profile to set referred_by
  -- SECURITY DEFINER bypasses RLS, so this will work
  UPDATE public.profiles
  SET referred_by = referrer_id,
      updated_at = NOW()
  WHERE id = new_user_id
    AND referred_by IS NULL; -- Only update if not already referred
  
  -- Increment the referrer's referral_count
  -- SECURITY DEFINER bypasses RLS, so this will work
  UPDATE public.profiles
  SET referral_count = COALESCE(referral_count, 0) + 1,
      updated_at = NOW()
  WHERE id = referrer_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.apply_referral(UUID, UUID) TO anon, authenticated;

-- Step 2: Ensure RLS allows users to update their own profile
-- (This is needed for the function to work, even though SECURITY DEFINER should bypass it)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 3: Add policy to allow updating referred_by field
-- This might be needed for the function to work properly
-- Note: SECURITY DEFINER should bypass this, but adding for safety
DROP POLICY IF EXISTS "Allow referral updates" ON public.profiles;

-- Actually, we don't need this because SECURITY DEFINER bypasses RLS
-- But let's verify the function works

-- Step 4: Verify function was created
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'apply_referral';

-- Step 5: Test query to check if function can be called
-- (This will show if there are permission issues)
SELECT 
  has_function_privilege('anon', 'apply_referral(uuid, uuid)', 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', 'apply_referral(uuid, uuid)', 'EXECUTE') as authenticated_can_execute;

