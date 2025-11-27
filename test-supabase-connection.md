# Test Supabase Cloud Connection

## Step 1: Verify .env File Exists

Check if you have a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=https://udqohxywiuhxojmffexk.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcW9oeHl3aXVoeG9qbWZmZXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDI2NDAsImV4cCI6MjA3OTcxODY0MH0.R_qC_qNpnuiomcLfjKJPURdYdpvMU0jH91-rJyo1ajk
```

## Step 2: Run the Migration in Supabase Dashboard

1. Go to: https://app.supabase.com/project/udqohxywiuhxojmffexk
2. Click **"SQL Editor"** → **"New query"**
3. Copy ALL code from `supabase/migrations/complete_setup.sql`
4. Paste and click **"Run"**
5. Wait for success message

## Step 3: Verify Tables Created

1. In Supabase Dashboard, click **"Table Editor"**
2. You should see **`profiles`** table
3. If you see it, tables are created! ✅

## Step 4: Test Connection from Your App

After running migration, restart your dev server:
```bash
npm run dev
```

Then try registering a user - it should save to the cloud!


