# Quick Fix - Function Not Found Error

## The Problem
Error: `Could not find the function public.create_user_profile(...) in the schema cache`

## The Solution - Run This SQL Script

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**

### Step 2: Run the Simple Script
1. Open the file: `supabase/simple_profile_creation.sql`
2. **Copy ALL the SQL code** (it's a complete, standalone script)
3. **Paste into SQL Editor**
4. Click **"Run"** (or press Ctrl+Enter)

### Step 3: Verify It Worked
After running, you should see:
- "Success. No rows returned" (or similar success message)
- No error messages

### Step 4: Test the Function
Run this query to verify the function exists:

```sql
SELECT routine_name, security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'create_user_profile';
```

Should return one row with `security_type = 'DEFINER'`.

### Step 5: Refresh and Test
1. **Wait 10-30 seconds** (for schema cache to update)
2. **Restart your dev server** (`npm run dev`)
3. **Try registering a new user**
4. Check browser console - should see "✅ Profile created successfully"

## What This Script Does

✅ Creates `generate_referral_code()` function  
✅ Creates `create_user_profile()` function with correct parameter names  
✅ Creates `handle_new_user()` trigger function  
✅ Creates trigger on `auth.users` table (auto-creates profiles)  
✅ Sets up RLS policies  
✅ Grants all necessary permissions  

## Why This Works

1. **Simple parameter names**: Uses `user_id`, `user_email`, etc. (no `p_` prefix)
2. **SECURITY DEFINER**: Function bypasses RLS automatically
3. **Complete setup**: Includes trigger, functions, and policies in one script
4. **Idempotent**: Safe to run multiple times (uses CREATE OR REPLACE)

## Troubleshooting

### Still Getting "Function Not Found"?

1. **Check you ran the complete script** - Must run ALL of it, not just parts
2. **Check the function exists**:
   ```sql
   SELECT * FROM information_schema.routines 
   WHERE routine_name = 'create_user_profile';
   ```
3. **Refresh schema cache**:
   - Supabase Dashboard → Settings → API → Refresh Schema Cache
4. **Wait longer** - Sometimes takes 30-60 seconds for cache to update
5. **Restart dev server** - Always restart after running SQL

### Function Exists But Still Not Found?

1. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)
2. **Check you're in the right project** - Verify Supabase URL matches your `.env`
3. **Check function signature matches**:
   ```sql
   SELECT 
     routine_name,
     parameters.parameter_name,
     parameters.data_type
   FROM information_schema.routines r
   JOIN information_schema.parameters p ON r.specific_name = p.specific_name
   WHERE r.routine_name = 'create_user_profile'
   ORDER BY p.ordinal_position;
   ```

### Permission Errors?

Run this to grant permissions:

```sql
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;
```

## Alternative: Use Trigger Only

If the RPC function still doesn't work, the **trigger should work automatically**:

1. The trigger fires when a user signs up
2. It automatically creates the profile
3. No RPC call needed from the frontend

The Register component will:
- Wait for trigger to create profile
- Only call RPC if trigger fails
- Show clear error if both fail

## Files Updated

- ✅ `supabase/simple_profile_creation.sql` - Complete, simple SQL script
- ✅ `src/pages/Register.tsx` - Updated to use correct parameter names


