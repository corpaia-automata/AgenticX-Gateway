-- =====================================================
-- Add RLS Policy for Viewing Referrals
-- =====================================================
-- This allows users to view profiles of people they referred
-- (where referred_by equals their user ID)
-- =====================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view their referrals" ON public.profiles;

-- Create policy to allow users to SELECT profiles where they are the referrer
-- This allows users to see the list of people who used their referral code
CREATE POLICY "Users can view their referrals"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (referred_by = auth.uid());

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
AND policyname = 'Users can view their referrals';

