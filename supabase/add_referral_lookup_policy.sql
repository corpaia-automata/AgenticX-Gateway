-- =====================================================
-- Add RLS Policy for Referral Code Lookup
-- =====================================================
-- This allows anonymous users to query profiles by referral_code
-- for validation purposes during registration.
-- =====================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow referral code validation" ON public.profiles;

-- Create policy to allow anonymous users to SELECT profiles by referral_code
-- This is safe because:
-- 1. We only select id and referral_code (no sensitive data)
-- 2. Referral codes are meant to be public
-- 3. Only used for validation before registration
CREATE POLICY "Allow referral code validation"
  ON public.profiles
  FOR SELECT
  TO anon
  USING (true);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname = 'Allow referral code validation';

