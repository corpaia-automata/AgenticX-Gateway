-- Fix RLS policies to ensure proper operations
-- This migration ensures all necessary policies are in place for the referral system

-- Ensure users can insert their own profile (though trigger handles this)
-- This is a safety net in case trigger fails
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Note: We don't need a separate policy for referral code validation
-- The application can use a database function with SECURITY DEFINER
-- to validate referral codes without exposing all profiles
-- The existing policies already cover:
-- - Users can view own profile
-- - Users can view profiles they referred
-- - This is sufficient for the application's needs

-- Add index on referral_code for faster lookups during registration
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);

-- Add index on referred_by for faster referral queries
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);

-- Add index on referral_count for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_referral_count ON public.profiles(referral_count DESC);

-- Ensure the trigger function can always insert (it's SECURITY DEFINER)
-- No additional policy needed as SECURITY DEFINER functions bypass RLS

-- Note: The existing policies should be sufficient, but we're adding:
-- 1. Explicit INSERT policy for users (safety net)
-- 2. Indexes for performance
-- 3. Clarification on referral code validation access

