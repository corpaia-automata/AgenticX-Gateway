# 🚀 Quick Start Guide - Connect to Supabase Cloud

## ⚠️ IMPORTANT: Supabase is ALWAYS Cloud-Based!

Your app **already connects to the cloud** - there's no local Supabase. The issue is:
1. Missing `.env` file (so app can't connect)
2. Tables not created yet (need to run migration)

---

## Step 1: Create .env File (REQUIRED!)

**Create a file named `.env` in the root directory** with this content:

```env
VITE_SUPABASE_URL=https://udqohxywiuhxojmffexk.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcW9oeHl3aXVoeG9qbWZmZXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDI2NDAsImV4cCI6MjA3OTcxODY0MH0.R_qC_qNpnuiomcLfjKJPURdYdpvMU0jH91-rJyo1ajk
```

**After creating .env file, restart your dev server:**
```bash
npm run dev
```

---

## Step 2: Create Tables in Supabase Cloud

1. **Open Supabase Dashboard:**
   - Go to: https://app.supabase.com/project/udqohxywiuhxojmffexk

2. **Open SQL Editor:**
   - Click **"SQL Editor"** in left sidebar
   - Click **"New query"** button

3. **Run Migration:**
   - Open file: `supabase/migrations/complete_setup.sql`
   - **Copy ALL the SQL code**
   - **Paste into SQL Editor**
   - Click **"Run"** button (or Ctrl+Enter)

4. **Verify Tables Created:**
   - Go to **"Table Editor"** in left sidebar
   - You should see **`profiles`** table ✅

---

## Step 3: Enable Email Authentication

1. In Supabase Dashboard, go to **"Authentication"** → **"Providers"**
2. Make sure **"Email"** is enabled
3. Configure email settings if needed

---

## Step 4: Test It!

1. Start your app: `npm run dev`
2. Try registering a new user
3. Go to Supabase Dashboard → Table Editor → profiles
4. You should see the new user's data! 🎉

---

## How It Works:

- ✅ **Supabase is Cloud-Based** - Your app connects to: `https://udqohxywiuhxojmffexk.supabase.co`
- ✅ **Authentication is Cloud** - Users authenticate through Supabase cloud
- ✅ **Data Saves to Cloud** - All data goes to your Supabase project in the cloud
- ✅ **No Local Database** - Everything is in the cloud

---

## Troubleshooting:

### "Tables not found" error:
- You haven't run the migration yet
- Go to Step 2 above

### "Missing environment variables" error:
- You haven't created `.env` file
- Go to Step 1 above

### "Connection failed" error:
- Check your internet connection
- Verify `.env` file has correct URL and key
- Restart dev server after creating `.env`

---

## After Setup:

Once you've:
1. ✅ Created `.env` file
2. ✅ Run the migration
3. ✅ Enabled email auth

Your app will:
- ✅ Connect to Supabase cloud automatically
- ✅ Save user data to cloud database
- ✅ Authenticate users through cloud
- ✅ Create profiles automatically when users register

**Everything is cloud-based - no local setup needed!** 🚀


