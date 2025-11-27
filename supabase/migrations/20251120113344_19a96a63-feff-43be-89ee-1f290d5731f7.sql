-- Fix search_path security issues for functions
-- Update generate_referral_code function with search_path
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    SELECT COUNT(*) INTO exists_check
    FROM public.profiles
    WHERE referral_code = code;
    
    IF exists_check = 0 THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Update update_updated_at_column function with search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Update increment_referral_count function (already has SET but ensuring it's correct)
CREATE OR REPLACE FUNCTION public.increment_referral_count(parent_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET referral_count = referral_count + 1
  WHERE id = parent_user_id;
END;
$$;