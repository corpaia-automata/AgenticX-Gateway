# Fix: Referrals Not Showing in Dashboard

## Problem
The referrals list is empty even when users have referrals. This is caused by:
1. **Missing RLS Policy**: Users can't query profiles where `referred_by` equals their user ID
2. **Missing Function**: The `apply_referral` function might not exist

## Solution

### Step 1: Add RLS Policy for Viewing Referrals

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Allow users to view profiles of people they referred
DROP POLICY IF EXISTS "Users can view their referrals" ON public.profiles;

CREATE POLICY "Users can view their referrals"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (referred_by = auth.uid());
```

**File**: `supabase/add_referrals_view_policy.sql`

### Step 2: Create apply_referral Function (if missing)

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Create the apply_referral function
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
  UPDATE public.profiles
  SET referred_by = referrer_id,
      updated_at = NOW()
  WHERE id = new_user_id
    AND referred_by IS NULL;
  
  -- Increment the referrer's referral_count
  UPDATE public.profiles
  SET referral_count = referral_count + 1,
      updated_at = NOW()
  WHERE id = referrer_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_referral(UUID, UUID) TO anon, authenticated;
```

**File**: `supabase/create_apply_referral_function.sql`

### Step 3: Verify

1. Check if the policy exists:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname = 'Users can view their referrals';
```

2. Check if the function exists:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'apply_referral';
```

3. Test the query:
```sql
-- Replace YOUR_USER_ID with your actual user ID
SELECT * FROM profiles 
WHERE referred_by = 'YOUR_USER_ID';
```

## How It Works

1. **RLS Policy**: Allows authenticated users to SELECT profiles where `referred_by = auth.uid()` (their user ID)
2. **apply_referral Function**: Sets the `referred_by` field when someone registers with a referral code
3. **Dashboard Query**: Now works because RLS allows viewing referred profiles

## After Fixing

- Refresh your dashboard
- Referrals should now appear in the "My Referrals" section
- New referrals will appear automatically via real-time subscription

