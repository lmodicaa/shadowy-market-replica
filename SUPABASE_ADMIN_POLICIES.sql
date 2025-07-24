-- SQL para habilitar políticas de administrador en Supabase
-- Ejecutar en Supabase Dashboard > SQL Editor

-- 1. Política para permitir que administradores eliminen pedidos Pix
CREATE POLICY "Admins can delete pix orders" ON pix_orders
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()::TEXT 
            AND (profiles.role = 'admin' OR profiles.is_admin = true)
        )
    );

-- 2. Política para permitir que administradores actualicen cualquier pedido Pix
CREATE POLICY "Admins can update any pix orders" ON pix_orders
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()::TEXT 
            AND (profiles.role = 'admin' OR profiles.is_admin = true)
        )
    );

-- 3. Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'pix_orders'
ORDER BY policyname;

-- 4. Verificar permisos de administrador del usuario actual
SELECT 
    id,
    email,
    role,
    is_admin,
    created_at
FROM profiles 
WHERE id = auth.uid()::TEXT;

-- 5. Si necesitas hacer tu usuario administrador, ejecuta:
-- UPDATE profiles SET is_admin = true WHERE id = auth.uid()::TEXT;

-- 6. Verificar que la tabla pix_orders tiene RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'pix_orders';