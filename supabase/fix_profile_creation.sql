-- =====================================================
-- Fix Profile Creation on Registration
-- =====================================================
-- This script creates:
-- 1. Function to generate unique referral codes
-- 2. Trigger function to auto-create profile when user signs up
-- 3. Trigger on auth.users table
-- 4. RLS policies for INSERT, SELECT, UPDATE operations
-- =====================================================

-- Step 1: Create or replace function to generate referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character alphanumeric code
    code := UPPER(
      SUBSTRING(
        MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) 
        FROM 1 FOR 8
      )
    );
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM public.profiles WHERE referral_code = code
    ) INTO exists_check;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create or replace function to create profile (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_phone TEXT
)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create or replace function to increment referral count
CREATE OR REPLACE FUNCTION public.increment_referral_count(parent_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET referral_count = referral_count + 1
  WHERE id = parent_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_phone TEXT;
  referral_code TEXT;
BEGIN
  -- Extract name and phone from user metadata
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.email
  );
  
  user_phone := COALESCE(
    NEW.raw_user_meta_data->>'phone',
    ''
  );
  
  -- Generate unique referral code
  referral_code := public.generate_referral_code();
  
  -- Insert profile for new user
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
    NEW.id,
    NEW.email,
    user_name,
    user_phone,
    referral_code,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate inserts
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Step 7: Create RLS policies
-- Policy 1: Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 2: Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 3: Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 8: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_referral_code() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_referral_count(UUID) TO anon, authenticated;

-- =====================================================
-- Verification Queries (Optional - run these to verify)
-- =====================================================
-- Check if trigger exists:
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
--
-- Check if policies exist:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
--
-- Check if functions exist:
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- AND routine_name IN ('generate_referral_code', 'create_user_profile', 'increment_referral_count', 'handle_new_user');
-- =====================================================

