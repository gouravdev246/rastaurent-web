-- =============================================
-- Posters Multi-tenancy Migration
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Add user_id column to posters
ALTER TABLE posters 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Optional: If you want to backfill existing posters to a specific user, do it here.
-- UPDATE posters SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;

-- 2. Drop existing policy (which was "allowed all authenticated")
DROP POLICY IF EXISTS "Admins can manage posters" ON posters;

-- 3. Create new policy: Users can only manage their OWN posters
CREATE POLICY "Users can manage own posters"
ON posters
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Update Public Policy to be safe (though application logic handles filtering)
-- We keep the existing "Public can read active posters" but strictly speaking
-- the public policy typically allows reading ALL active posters. 
-- The filtering happens in the query: .eq('user_id', table.user_id)
-- So the existing public policy is fine:
-- TYPE: "Public can read active posters" -> USING (is_active = true)

