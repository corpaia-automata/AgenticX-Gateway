# Function Not Found Error - Fix Guide

## Error
`Could not find the function public.create_user_profile(user_email, user_id, user_name, user_phone) in the schema cache`

## Causes
1. Function wasn't created in Supabase database
2. Schema cache is stale
3. Function signature mismatch
4. Missing grants/permissions

## Solution

### Step 1: Run the Standalone Function Script

1. Open Supabase Dashboard → **SQL Editor**
2. Open `supabase/create_profile_function.sql`
3. **Copy ALL the SQL code**
4. **Paste into SQL Editor**
5. Click **"Run"**

This script:
- Drops and recreates the function with correct signature
- Sets `SECURITY DEFINER` to bypass RLS
- Grants execute permissions to `anon` and `authenticated` roles
- Verifies the function was created

### Step 2: Verify Function Exists

Run this query in SQL Editor:

```sql
SELECT 
  routine_name,
  routine_type,
  security_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'create_user_profile';
```

Should return one row showing:
- `routine_name = 'create_user_profile'`
- `security_type = 'DEFINER'`

### Step 3: Check Permissions

```sql
SELECT 
  grantee,
  privilege_type
FROM information_schema.routine_privileges 
WHERE routine_schema = 'public' 
AND routine_name = 'create_user_profile';
```

Should show grants for:
- `anon`
- `authenticated`

### Step 4: Refresh Schema Cache (if needed)

If function exists but still not found:

1. In Supabase Dashboard, go to **Settings** → **API**
2. Scroll down and click **"Refresh Schema Cache"** or **"Reload"**
3. Wait a few seconds
4. Try registration again

### Step 5: Alternative - Use Complete Script

If the standalone script doesn't work, run the complete script:

1. Open `supabase/fix_profile_creation.sql`
2. Copy ALL code
3. Run in SQL Editor

This includes all functions, triggers, and policies.

## Fallback in Code

The Register component now has a fallback:
- First tries RPC function `create_user_profile()`
- If that fails, tries direct INSERT (might work if RLS allows)
- Shows clear error message if both fail

## Troubleshooting

### Function Still Not Found After Running SQL?

1. **Check you're in the right project** - Make sure you're in the correct Supabase project
2. **Check schema** - Function must be in `public` schema
3. **Restart dev server** - After running SQL, restart your dev server
4. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)

### Permission Denied Error?

Run this to grant permissions:

```sql
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;
```

### Schema Cache Issues?

1. Wait 30-60 seconds after creating function
2. Refresh schema cache in Supabase Dashboard
3. Restart your dev server
4. Clear browser cache

## Quick Test

After running the SQL, test the function directly:

```sql
-- Test the function (replace with actual values)
SELECT public.create_user_profile(
  '00000000-0000-0000-0000-000000000000'::UUID,
  'test@example.com',
  'Test User',
  '+1234567890'
);
```

Should return a referral code string.

