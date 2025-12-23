-- =====================================================
-- Update validate_referral_code for Case-Insensitive Matching
-- =====================================================
-- This ensures the function matches referral codes regardless of case
-- =====================================================

CREATE OR REPLACE FUNCTION public.validate_referral_code(code text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id
  FROM profiles
  WHERE LOWER(referral_code) = LOWER(code)
  LIMIT 1;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.validate_referral_code(text)
TO anon, authenticated;

-- Verify function was updated
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'validate_referral_code';

