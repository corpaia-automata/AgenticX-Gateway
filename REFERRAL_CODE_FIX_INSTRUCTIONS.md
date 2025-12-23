# Referral Code Validation Fix - Instructions

## Problem Fixed
Referral code validation was failing in production because RLS (Row Level Security) policies blocked anonymous users from querying profiles by `referral_code`. This caused the "Invalid referral code" error even when codes were valid.

## Changes Made

### 1. SQL Script Created
**File:** `supabase/add_referral_lookup_policy.sql`

This script adds an RLS policy that allows anonymous users to query profiles by `referral_code` for validation purposes.

### 2. Register.tsx Updated
**File:** `src/pages/Register.tsx`

Improvements made:
- ✅ URL decoding for referral codes (handles encoded characters)
- ✅ Better error handling that distinguishes:
  - RLS policy errors (security blocking)
  - Invalid codes (code doesn't exist)
  - Other database errors
- ✅ Enhanced logging with detailed error information
- ✅ Normalized referral codes (trim, uppercase, remove whitespace)

## What You Need to Do

### Step 1: Run the SQL Script in Supabase

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor** in the left sidebar
3. Click **"New query"**
4. Open the file: `supabase/add_referral_lookup_policy.sql`
5. **Copy ALL the SQL code** from the file
6. **Paste it into the SQL Editor**
7. Click **"Run"** (or press Ctrl+Enter)
8. You should see a success message and a verification query result

### Step 2: Verify the Policy Was Created

Run this query in SQL Editor to verify:

```sql
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname = 'Allow referral code validation';
```

**Expected Result:** Should return 1 row showing the policy exists.

### Step 3: Test the Fix

1. Deploy your updated code to production
2. Try registering with a valid referral code (e.g., `/register?ref=ABC12345`)
3. The referral code should now validate successfully
4. Check browser console for detailed logs

## How It Works Now

1. **URL Decoding**: Referral codes from URLs are properly decoded
2. **Normalization**: Codes are trimmed, uppercased, and whitespace removed
3. **RLS Policy**: Anonymous users can now query profiles by `referral_code`
4. **Error Handling**: 
   - RLS errors show specific message about security policy
   - Invalid codes show friendly warning (registration still works)
   - Other errors are logged with full details

## Error Messages

- **RLS Error**: "Referral code validation failed due to security policy. Please contact support or register without a referral code."
- **Invalid Code**: "Invalid referral code. You can still register without it."
- **Other Error**: "Could not validate referral code. You can still register without it."

## Security Note

The RLS policy allows anonymous users to SELECT profiles by `referral_code`, but:
- ✅ Only `id` and `referral_code` fields are selected (no sensitive data)
- ✅ Referral codes are meant to be public anyway
- ✅ Only used for validation before registration
- ✅ Users can still register even if validation fails

## Troubleshooting

### If referral codes still don't work:

1. **Check if policy exists:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

2. **Check browser console** for detailed error logs

3. **Verify RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'profiles';
   ```

4. **Check if referral codes exist:**
   ```sql
   SELECT id, referral_code FROM profiles LIMIT 5;
   ```

## Next Steps

After running the SQL script:
- ✅ Referral code validation will work for anonymous users
- ✅ Users can register with valid referral codes
- ✅ Referral linking will work correctly
- ✅ Referral counts will increment properly

The referral chain should now work correctly in production!

