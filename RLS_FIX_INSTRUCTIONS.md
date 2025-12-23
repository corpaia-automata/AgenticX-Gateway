# RLS Policy Fix - Quick Instructions

## Problem
Error: `new row violates row-level security policy for table "profiles"`

This happens because RLS policies block direct INSERT operations from the client.

## Solution
Use a database function with `SECURITY DEFINER` that bypasses RLS to create profiles.

## Steps to Fix

### 1. Run Updated SQL Script

1. Open Supabase Dashboard → **SQL Editor**
2. Open `supabase/fix_profile_creation.sql`
3. **Copy ALL the SQL code** (it now includes the `create_user_profile` function)
4. **Paste into SQL Editor**
5. Click **"Run"**

The updated script includes:
- ✅ `create_user_profile()` function - Bypasses RLS using SECURITY DEFINER
- ✅ Trigger function - Auto-creates profiles on signup
- ✅ RLS policies - For SELECT, UPDATE operations
- ✅ Proper grants - Allows calling the function

### 2. Verify Function Was Created

Run this query in SQL Editor:

```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'create_user_profile';
```

Should return one row with the function name.

### 3. Test Registration

1. Restart your dev server if it's running
2. Try registering a new user
3. Check browser console - should see "✅ Profile created successfully"
4. Check Supabase Table Editor - profile should exist

## How It Works Now

### Automatic (Trigger)
- When user signs up → Trigger fires → Profile created automatically
- Uses `handle_new_user()` function with SECURITY DEFINER

### Manual (Fallback)
- If trigger fails → Register component calls `create_user_profile()` RPC
- Function runs with SECURITY DEFINER → Bypasses RLS → Profile created

## Key Changes

1. **New Function**: `create_user_profile(user_id, user_email, user_name, user_phone)`
   - Runs with `SECURITY DEFINER` to bypass RLS
   - Returns the generated referral code

2. **Updated Register Component**:
   - Uses `supabase.rpc("create_user_profile", {...})` instead of direct INSERT
   - No more RLS policy violations!

## Troubleshooting

### Still Getting RLS Error?

1. **Make sure you ran the updated SQL script** - The `create_user_profile` function must exist

2. **Check function exists**:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'create_user_profile';
   ```

3. **Check function permissions**:
   ```sql
   SELECT routine_name, security_type 
   FROM information_schema.routines 
   WHERE routine_name = 'create_user_profile';
   ```
   Should show `security_type = 'DEFINER'`

4. **Verify grants**:
   ```sql
   SELECT grantee, privilege_type 
   FROM information_schema.routine_privileges 
   WHERE routine_name = 'create_user_profile';
   ```
   Should show grants for `anon` and `authenticated`

### Function Not Found Error?

- Make sure you ran the complete SQL script
- The function must be in the `public` schema
- Restart your dev server after running SQL

## Files Updated

1. ✅ `supabase/fix_profile_creation.sql` - Added `create_user_profile()` function
2. ✅ `src/pages/Register.tsx` - Uses RPC function instead of direct INSERT
3. ✅ `src/integrations/supabase/types.ts` - Added function type definition

