# Supabase Setup Instructions

## ✅ Configuration Complete!

Your Supabase project has been configured with the following credentials:
- **Project URL**: https://udqohxywiuhxojmffexk.supabase.co
- **Anon Key**: Configured
- **Service Role Key**: Configured (for edge functions)

## 📋 Next Steps

### 1. Create Environment File

Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=https://udqohxywiuhxojmffexk.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcW9oeHl3aXVoeG9qbWZmZXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDI2NDAsImV4cCI6MjA3OTcxODY0MH0.R_qC_qNpnuiomcLfjKJPURdYdpvMU0jH91-rJyo1ajk
```

### 2. Run Database Migrations

You need to apply the database migrations to create the tables and functions:

**Option A: Using Supabase CLI (Recommended)**
```bash
# If you have Supabase CLI installed
supabase db push
```

**Option B: Using Supabase Dashboard**
1. Go to your Supabase project: https://app.supabase.com/project/udqohxywiuhxojmffexk
2. Navigate to SQL Editor
3. Run the migrations in order:
   - `supabase/migrations/20251120113331_500bfd6d-d300-436a-9509-3a6fd3fef863.sql`
   - `supabase/migrations/20251120113344_19a96a63-feff-43be-89ee-1f290d5731f7.sql`
   - `supabase/migrations/20251120120000_fix_rls_policies.sql`

### 3. Deploy Edge Function (Optional but Recommended)

The QR code generation edge function needs to be deployed:

**Using Supabase CLI:**
```bash
supabase functions deploy generate-qr
```

**Or manually:**
1. Go to Edge Functions in Supabase Dashboard
2. Create new function named `generate-qr`
3. Copy the code from `supabase/functions/generate-qr/index.ts`
4. Set environment variables:
   - `SUPABASE_URL`: https://udqohxywiuhxojmffexk.supabase.co
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key

### 4. Test the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Try registering a new user
3. Check if the profile is created automatically
4. Test the referral system

## 🔧 Database Schema

The migrations will create:
- `profiles` table with referral tracking
- Database functions for referral code generation
- RLS policies for security
- Indexes for performance

## 📝 Important Notes

- The `.env` file is gitignored for security
- Make sure your Supabase project has email authentication enabled
- The edge function uses the service role key (keep it secret!)
- All migrations include proper RLS policies for security

## 🐛 Troubleshooting

If you encounter issues:
1. Check that `.env` file exists and has correct values
2. Verify migrations have been run successfully
3. Check Supabase dashboard for any errors
4. Ensure edge function is deployed if using QR generation

