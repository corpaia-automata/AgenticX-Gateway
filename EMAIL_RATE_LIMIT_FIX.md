# Fix "Email Rate Limit Exceeded" Error

## Why This Happens

Supabase has rate limits on emails to prevent spam:
- **Free tier**: ~3-4 emails per hour per user
- **Pro tier**: Higher limits
- This includes: confirmation emails, password resets, magic links

Common causes:
1. Testing registration multiple times quickly
2. Email confirmation enabled (sends email on every signup)
3. Multiple failed login attempts triggering emails

## Quick Fix: Disable Email Confirmation (Development)

### Step 1: Open Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click **"Authentication"** in the left sidebar
3. Click **"Settings"** (or "Configuration")

### Step 2: Disable Email Confirmation

1. Find **"Email Auth"** section
2. Look for **"Confirm email"** or **"Enable email confirmations"**
3. **Turn it OFF** (toggle switch)
4. Click **"Save"**

Now users can register without email confirmation, and you won't hit rate limits during development.

### Step 3: Re-enable for Production

When you're ready for production:
1. Turn email confirmation back ON
2. Consider using a custom SMTP provider for higher limits

## Alternative Solutions

### Option 1: Wait for Rate Limit to Reset

- Rate limits usually reset after **1 hour**
- Check your email - you might have received the confirmation emails

### Option 2: Use Custom SMTP (Production)

For production, configure a custom SMTP provider:
1. Supabase Dashboard → **Authentication** → **SMTP Settings**
2. Configure with your email provider (SendGrid, Mailgun, etc.)
3. Higher rate limits and better deliverability

### Option 3: Use Different Email Addresses

For testing, use different email addresses each time:
- `test1@example.com`
- `test2@example.com`
- etc.

## Better Error Handling

The app now shows a user-friendly message when this error occurs. Users will see:
- Clear explanation of what happened
- Suggestion to wait or try again later
- Alternative options if available

## Production Best Practices

1. **Enable email confirmation** - Important for security
2. **Use custom SMTP** - Better limits and deliverability
3. **Implement rate limiting** - Prevent abuse on your side
4. **Monitor email usage** - Track in Supabase Dashboard

## Check Your Current Settings

In Supabase Dashboard:
- **Authentication** → **Providers** → **Email**
- Check if "Confirm email" is enabled
- Review rate limit settings if available

