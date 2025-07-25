-- SQL para corrigir permissões de administrador para exclusão de pedidos PIX
-- Execute este código no Supabase Dashboard > SQL Editor

-- 1. Verificar se as políticas RLS existem para pix_orders
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual
FROM pg_policies 
WHERE tablename = 'pix_orders'
ORDER BY policyname;

-- 2. Habilitar RLS na tabela pix_orders se não estiver habilitado
ALTER TABLE pix_orders ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas existentes (ignorar erros se não existirem)
DROP POLICY IF EXISTS "Admins can view all pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Admins can update any pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Admins can delete any pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Users can view own pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Users can create own pix orders" ON pix_orders;

-- 4. Criar política para permitir que administradores vejam todos os pedidos PIX
CREATE POLICY "Admins can view all pix orders" ON pix_orders
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()::TEXT 
            AND (profiles.role = 'admin' OR profiles.is_admin = true)
        )
    );

-- 5. Criar política para permitir que administradores atualizem qualquer pedido PIX
CREATE POLICY "Admins can update any pix orders" ON pix_orders
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()::TEXT 
            AND (profiles.role = 'admin' OR profiles.is_admin = true)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()::TEXT 
            AND (profiles.role = 'admin' OR profiles.is_admin = true)
        )
    );

-- 6. Criar política para permitir que administradores excluam qualquer pedido PIX
CREATE POLICY "Admins can delete any pix orders" ON pix_orders
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()::TEXT 
            AND (profiles.role = 'admin' OR profiles.is_admin = true)
        )
    );

-- 7. Permitir que usuários vejam seus próprios pedidos
CREATE POLICY "Users can view own pix orders" ON pix_orders
    FOR SELECT 
    USING (auth.uid()::TEXT = user_id);

-- 8. Permitir que usuários criem seus próprios pedidos
CREATE POLICY "Users can create own pix orders" ON pix_orders
    FOR INSERT 
    WITH CHECK (auth.uid()::TEXT = user_id);

-- 8. Verificar se o usuário atual tem permissões de administrador
SELECT 
    id,
    email,
    role,
    is_admin,
    created_at
FROM profiles 
WHERE id = auth.uid()::TEXT;

-- 9. Se você não for administrador, execute este comando para se tornar admin:
-- UPDATE profiles SET is_admin = true WHERE id = auth.uid()::TEXT;

-- 10. Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, cmd, permissive, roles
FROM pg_policies 
WHERE tablename = 'pix_orders'
ORDER BY policyname;

-- 11. Testar se a exclusão funciona (substitua pelo ID real de um pedido)
-- DELETE FROM pix_orders WHERE id = 'PIX_MATE_PULSE_1753420500971_7ynz8n31d';