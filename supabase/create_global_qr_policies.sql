-- Enable RLS on qr_codes table (if not already enabled)
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to ALL qr_codes (for free/public access)
-- This makes all QR codes publicly accessible
CREATE POLICY "Allow public read access to qr_codes"
ON public.qr_codes
FOR SELECT
TO public
USING (true);

-- Policy: Allow authenticated users to insert qr_codes
CREATE POLICY "Allow authenticated users to insert qr_codes"
ON public.qr_codes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to update qr_codes (optional, for admin updates)
CREATE POLICY "Allow authenticated users to update qr_codes"
ON public.qr_codes
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Alternative: If you want ONLY the GLOBAL code to be public, use this instead:
-- DROP POLICY IF EXISTS "Allow public read access to qr_codes" ON public.qr_codes;
-- CREATE POLICY "Allow public read access to global qr_code only"
-- ON public.qr_codes
-- FOR SELECT
-- TO public
-- USING (code = 'GLOBAL');
