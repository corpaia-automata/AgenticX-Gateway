# 🚀 How to Migrate Database to Supabase Cloud

## Quick Setup Guide

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://app.supabase.com/project/udqohxywiuhxojmffexk
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New query"** button

### Step 2: Run the Complete Migration

1. Open the file: `supabase/migrations/complete_setup.sql`
2. **Copy ALL the contents** of that file
3. **Paste it into the SQL Editor** in Supabase
4. Click **"Run"** button (or press Ctrl+Enter)

### Step 3: Verify Tables Were Created

1. Go to **"Table Editor"** in the left sidebar
2. You should now see the **`profiles`** table! ✅

### Step 4: Enable Email Authentication (Important!)

1. Go to **"Authentication"** → **"Providers"** in Supabase Dashboard
2. Make sure **"Email"** provider is enabled
3. Configure email settings if needed

### Step 5: Test Your Application

1. Make sure you have created the `.env` file with your credentials
2. Start your app: `npm run dev`
3. Try registering a new user
4. Check the `profiles` table - a new row should be created automatically!

---

## What This Migration Creates:

✅ **`profiles` table** - Stores user data and referral information
✅ **Database Functions** - For generating referral codes and tracking
✅ **Triggers** - Automatically creates profile when user signs up
✅ **RLS Policies** - Security rules for data access
✅ **Indexes** - For fast queries

---

## Troubleshooting

### If you see errors:

1. **"relation already exists"** - The table might already exist. The migration uses `IF NOT EXISTS` so it should be safe, but you can drop the table first if needed.

2. **"permission denied"** - Make sure you're running as the database owner. The SQL Editor runs with full permissions by default.

3. **"trigger already exists"** - The migration drops existing triggers first, so this shouldn't happen. If it does, you can manually drop them.

### To reset everything (if needed):

```sql
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS public.profiles CASCADE;
```

Then run the complete_setup.sql again.

---

## Next Steps After Migration:

1. ✅ Tables are created
2. ✅ Functions are set up
3. ✅ Triggers are active
4. ⏭️ Deploy Edge Function (optional - for QR code generation)
5. ⏭️ Test registration flow

---

## Need Help?

If you encounter any issues:
1. Check the Supabase Dashboard for error messages
2. Verify your `.env` file has correct credentials
3. Make sure Email authentication is enabled in Supabase

