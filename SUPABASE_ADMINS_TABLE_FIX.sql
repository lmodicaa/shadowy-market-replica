-- SQL para usar tabla admins en lugar de profiles para verificar permisos
-- Execute no Supabase Dashboard > SQL Editor

-- 1. Habilitar RLS na tabela pix_orders
ALTER TABLE pix_orders ENABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Admin delete pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Admin view all pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Admin update any pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Users view own pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Users create own pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Admins can view all pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Admins can update any pix orders" ON pix_orders;
DROP POLICY IF EXISTS "Admins can delete any pix orders" ON pix_orders;

-- 3. Política para administradores excluírem qualquer pedido PIX (usando tabla admins)
CREATE POLICY "Admin delete pix orders" ON pix_orders
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id::TEXT = auth.uid()::TEXT
        )
    );

-- 4. Política para administradores verem todos os pedidos PIX
CREATE POLICY "Admin view all pix orders" ON pix_orders
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id::TEXT = auth.uid()::TEXT
        )
    );

-- 5. Política para administradores atualizarem qualquer pedido PIX
CREATE POLICY "Admin update any pix orders" ON pix_orders
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id::TEXT = auth.uid()::TEXT
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

-- 8. Verificar se você está na tabla admins
SELECT 
    user_id::TEXT,
    created_at,
    updated_at
FROM admins 
WHERE user_id::TEXT = auth.uid()::TEXT;

-- 9. SE NÃO APARECER RESULTADO, adicione-se como admin:
-- INSERT INTO admins (user_id) VALUES (auth.uid()::TEXT);

-- 10. Verificar estrutura da tabla admins
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'admins'
ORDER BY ordinal_position;

-- 11. Verificar políticas criadas
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename = 'pix_orders'
ORDER BY policyname;