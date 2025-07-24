-- SQL to fix RLS policies for pix_orders table
-- Run this in your Supabase Dashboard > SQL Editor

-- 1. Add policy to allow users to insert their own pix orders
CREATE POLICY "Users can insert own pix orders" ON pix_orders
    FOR INSERT 
    WITH CHECK (auth.uid()::TEXT = user_id);

-- 2. Add policy to allow users to update their own pix orders
CREATE POLICY "Users can update own pix orders" ON pix_orders
    FOR UPDATE 
    USING (auth.uid()::TEXT = user_id)
    WITH CHECK (auth.uid()::TEXT = user_id);

-- 3. Verify the policies are created correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'pix_orders'
ORDER BY policyname;

-- 4. Test the setup (optional - this should work after running the policies)
-- This will be handled by your application when you click a plan button