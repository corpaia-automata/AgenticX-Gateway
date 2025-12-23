-- =====================================================
-- Create apply_referral Function
-- =====================================================
-- This function sets the referred_by field and increments referral_count
-- =====================================================

-- Drop function if exists
DROP FUNCTION IF EXISTS public.apply_referral(UUID, UUID);

-- Create the apply_referral function
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
  UPDATE public.profiles
  SET referred_by = referrer_id,
      updated_at = NOW()
  WHERE id = new_user_id
    AND referred_by IS NULL; -- Only update if not already referred
  
  -- Increment the referrer's referral_count
  UPDATE public.profiles
  SET referral_count = referral_count + 1,
      updated_at = NOW()
  WHERE id = referrer_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.apply_referral(UUID, UUID) TO anon, authenticated;

-- Verify function was created
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'apply_referral';

