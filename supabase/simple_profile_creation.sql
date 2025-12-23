-- =====================================================
-- Simple Profile Creation - Guaranteed to Work
-- =====================================================
-- This is a simpler, more reliable approach
-- =====================================================

-- Step 1: Ensure generate_referral_code function exists
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT 
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    code := UPPER(
      SUBSTRING(
        MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) 
        FROM 1 FOR 8
      )
    );
    
    SELECT EXISTS(
      SELECT 1 FROM public.profiles WHERE referral_code = code
    ) INTO exists_check;
    
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Step 2: Create profile creation function (simple parameter names for Supabase)
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
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    updated_at = NOW();
  
  RETURN referral_code;
END;
$$;

-- Step 3: Grant permissions
GRANT EXECUTE ON FUNCTION public.generate_referral_code() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO anon, authenticated;

-- Step 4: Create trigger function (for automatic creation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
  v_user_phone TEXT;
BEGIN
  v_user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.email
  );
  
  v_user_phone := COALESCE(
    NEW.raw_user_meta_data->>'phone',
    ''
  );
  
  -- Use the create_user_profile function
  PERFORM public.create_user_profile(
    user_id := NEW.id,
    user_email := NEW.email,
    user_name := v_user_name,
    user_phone := v_user_phone
  );
  
  RETURN NEW;
END;
$$;

-- Step 5: Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Set up RLS policies (if not already set)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 7: Verify everything was created
DO $$
BEGIN
  RAISE NOTICE 'Function create_user_profile exists: %', 
    EXISTS(
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name = 'create_user_profile'
    );
  
  RAISE NOTICE 'Trigger on_auth_user_created exists: %',
    EXISTS(
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'on_auth_user_created'
    );
END $$;

-- Test query to verify function works (optional - comment out if you don't want to test)
-- SELECT public.create_user_profile(
--   gen_random_uuid(),
--   'test@example.com',
--   'Test User',
--   '+1234567890'
-- );

