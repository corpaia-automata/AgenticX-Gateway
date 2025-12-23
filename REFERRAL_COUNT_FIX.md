# Fix: Referral Count and referred_by Not Working

## Problem
- `referral_count` is not incrementing when someone registers with a referral code
- `referred_by` field is not being set on new user profiles
- Dashboard shows 0 referrals even when people have registered

## Root Causes

1. **Missing `apply_referral` Function**: The function might not exist in your database
2. **RLS Policy Issues**: Even with `SECURITY DEFINER`, there might be permission issues
3. **Function Not Being Called**: The function call might be failing silently

## Solution

### Step 1: Create/Update apply_referral Function

Run this SQL in Supabase Dashboard → SQL Editor:

**File**: `supabase/fix_referral_count_and_referred_by.sql`

```sql
-- Drop and recreate the apply_referral function
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
  SET referral_count = COALESCE(referral_count, 0) + 1,
      updated_at = NOW()
  WHERE id = referrer_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_referral(UUID, UUID) TO anon, authenticated;
```

### Step 2: Verify Function Exists

Run this query to check:

```sql
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'apply_referral';
```

Should return one row with the function details.

### Step 3: Test the Function

You can test the function manually (replace UUIDs with actual user IDs):

```sql
-- Test: Apply a referral (replace with actual UUIDs)
SELECT public.apply_referral(
  'new-user-uuid-here'::UUID,
  'referrer-uuid-here'::UUID
);

-- Check if it worked
SELECT id, name, referred_by, referral_count 
FROM profiles 
WHERE id = 'new-user-uuid-here' OR id = 'referrer-uuid-here';
```

### Step 4: Check Browser Console

After running the SQL fix:

1. Open browser console (F12)
2. Register a new user with a referral code
3. Look for these logs:
   - `📞 Calling apply_referral function...`
   - `✅ Referral applied successfully` OR `❌ Error applying referral:`
   - `🔍 Verification - New user profile:`
   - `🔍 Verification - Referrer's count:`

### Step 5: Verify in Database

Check the profiles table directly:

```sql
-- Check a specific user's referral count
SELECT id, name, email, referral_count, referred_by
FROM profiles
WHERE id = 'your-user-id-here';

-- Check all referrals for a user
SELECT id, name, email, created_at
FROM profiles
WHERE referred_by = 'your-user-id-here'
ORDER BY created_at DESC;
```

## What Was Fixed

1. **Enhanced Error Logging**: The Register component now shows detailed error messages
2. **Verification Checks**: After applying referral, it verifies the update worked
3. **Toast Notifications**: Users see success/error messages
4. **Function Improvement**: Added `COALESCE` to handle NULL referral_count values

## Expected Behavior After Fix

1. When someone registers with `?ref=CODE`:
   - New user's `referred_by` is set to referrer's ID
   - Referrer's `referral_count` increments by 1
   - Success message appears

2. In Dashboard:
   - Referral count shows correct number
   - Referrals list shows all referred users
   - Count updates automatically via real-time subscription

## Troubleshooting

### Function Still Not Working?

1. **Check Function Permissions**:
```sql
SELECT 
  has_function_privilege('anon', 'apply_referral(uuid, uuid)', 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', 'apply_referral(uuid, uuid)', 'EXECUTE') as authenticated_can_execute;
```

Both should return `true`.

2. **Check RLS Policies**:
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

Should show policies for SELECT, INSERT, UPDATE.

3. **Check Function Security**:
```sql
SELECT 
  routine_name,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'apply_referral';
```

`security_type` should be `DEFINER`.

### Still Not Working?

1. Check browser console for detailed error messages
2. Check Supabase logs (Dashboard → Logs)
3. Verify the function is being called (check console logs)
4. Manually test the function with SQL (Step 3 above)

