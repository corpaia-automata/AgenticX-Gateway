# Supabase Setup Guide - Fix Profile Creation Error

## Quick Fix (Recommended)

Run the complete setup script in your Supabase SQL Editor. This will create all necessary functions, triggers, and RLS policies.

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project
4. Click on **"SQL Editor"** in the left sidebar

### Step 2: Run the Complete Setup Script

1. In the SQL Editor, click **"New query"**
2. Open the file: `supabase/simple_profile_creation.sql` from your project
3. **Copy ALL the SQL code** from that file
4. **Paste it into the SQL Editor**
5. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)

You should see: **"Success. No rows returned"** or similar success message.

### Step 3: Verify Everything Was Created

Run these verification queries one by one in the SQL Editor:

#### Check Functions Exist:
```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'generate_referral_code', 
  'create_user_profile', 
  'increment_referral_count', 
  'handle_new_user'
);
```

**Expected Result:** Should return 4 rows (one for each function)

#### Check Trigger Exists:
```sql
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

**Expected Result:** Should return 1 row with the trigger name

#### Check RLS Policies Exist:
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
```

**Expected Result:** Should return 3 rows (INSERT, SELECT, UPDATE policies)

### Step 4: Verify RLS is Enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';
```

**Expected Result:** `rowsecurity` should be `true`

### Step 5: Test Registration

1. Go back to your app
2. Try registering a new user
3. Check the browser console for success messages
4. In Supabase Dashboard → **Table Editor** → **profiles**, verify the new profile was created

## What This Script Does

The `simple_profile_creation.sql` script creates:

1. **`generate_referral_code()`** - Generates unique 8-character referral codes
2. **`create_user_profile()`** - Creates user profiles (bypasses RLS with SECURITY DEFINER)
3. **`increment_referral_count()`** - Increments referral counts for referrers
4. **`handle_new_user()`** - Trigger function that auto-creates profiles on signup
5. **Trigger** - Automatically fires when a new user is created
6. **RLS Policies** - Allows users to view/update their own profiles

## Troubleshooting

### If you get "function already exists" errors:
- This is normal - the script uses `CREATE OR REPLACE`, so it's safe to run multiple times

### If you get permission errors:
- Make sure you're running the SQL as the database owner (default in Supabase Dashboard)
- Check that you're in the correct project

### If profile still doesn't create:
1. Check browser console for specific error messages
2. Verify the trigger is active:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
3. Check if RLS is blocking:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
4. Try manually calling the function:
   ```sql
   -- Replace with a test UUID
   SELECT public.create_user_profile(
     '00000000-0000-0000-0000-000000000000'::uuid,
     'test@example.com',
     'Test User',
     '+1234567890'
   );
   ```

## Alternative: If Simple Script Doesn't Work

If `simple_profile_creation.sql` doesn't work, try `supabase/fix_profile_creation.sql` instead. It has the same functionality but with slightly different implementation.

## Need More Help?

Check the browser console logs - they will show exactly which step is failing:
- "✅ Profile exists (created by trigger)" - Trigger is working
- "📝 Attempting to create profile via RPC function..." - Trigger failed, using fallback
- "❌ RPC function error" - Function doesn't exist or has wrong permissions

