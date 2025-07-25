-- SQL simplificado para corrigir permissões de administrador PIX
-- Execute no Supabase Dashboard > SQL Editor

-- 1. Habilitar RLS na tabela pix_orders
ALTER TABLE pix_orders ENABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes para começar limpo
DROP POLICY IF EXISTS "Admins can view all pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Admins can update any pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Admins can delete any pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Users can view own pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Users can create own pix orders" ON pix_orders;

-- 3. Política para administradores excluírem qualquer pedido PIX
CREATE POLICY "Admin delete pix orders" ON pix_orders
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id::TEXT = auth.uid()::TEXT 
            AND profiles.is_admin = true
        )
    );

-- 4. Política para administradores verem todos os pedidos PIX
CREATE POLICY "Admin view all pix orders" ON pix_orders
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id::TEXT = auth.uid()::TEXT 
            AND profiles.is_admin = true
        )
    );

-- 5. Política para administradores atualizarem qualquer pedido PIX
CREATE POLICY "Admin update any pix orders" ON pix_orders
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id::TEXT = auth.uid()::TEXT 
            AND profiles.is_admin = true
        )
    );

-- 6. Política para usuários verem seus próprios pedidos
CREATE POLICY "Users view own pix orders" ON pix_orders
    FOR SELECT 
    USING (auth.uid()::TEXT = user_id);

-- 7. Política para usuários criarem seus próprios pedidos
CREATE POLICY "Users create own pix orders" ON pix_orders
    FOR INSERT 
    WITH CHECK (auth.uid()::TEXT = user_id);

-- 8. Verificar se você é administrador
SELECT 
    id::TEXT as user_id,
    email,
    is_admin,
    created_at
FROM profiles 
WHERE id::TEXT = auth.uid()::TEXT;

-- 9. SE NÃO FOR ADMIN, execute este comando para se tornar admin:
-- UPDATE profiles SET is_admin = true WHERE id::TEXT = auth.uid()::TEXT;

-- 10. Verificar políticas criadas
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename = 'pix_orders'
ORDER BY policyname;