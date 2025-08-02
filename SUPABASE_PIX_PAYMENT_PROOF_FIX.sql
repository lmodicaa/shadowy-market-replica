-- SQL para corrigir a tabela pix_orders e adicionar campos de comprovante de pagamento
-- Execute este script no SQL Editor do Supabase

-- Adicionar campos para comprovante de pagamento se não existirem
DO $$
BEGIN
    -- Adicionar pix_qr_image se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pix_orders' AND column_name='pix_qr_image') THEN
        ALTER TABLE pix_orders ADD COLUMN pix_qr_image TEXT;
    END IF;
    
    -- Adicionar pix_type se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pix_orders' AND column_name='pix_type') THEN
        ALTER TABLE pix_orders ADD COLUMN pix_type TEXT;
    END IF;
    
    -- Adicionar payment_proof_file se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pix_orders' AND column_name='payment_proof_file') THEN
        ALTER TABLE pix_orders ADD COLUMN payment_proof_file TEXT;
    END IF;
    
    -- Adicionar payment_proof_filename se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pix_orders' AND column_name='payment_proof_filename') THEN
        ALTER TABLE pix_orders ADD COLUMN payment_proof_filename TEXT;
    END IF;
    
    -- Adicionar payment_proof_type se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pix_orders' AND column_name='payment_proof_type') THEN
        ALTER TABLE pix_orders ADD COLUMN payment_proof_type TEXT;
    END IF;
    
    -- Adicionar payment_confirmed_at se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pix_orders' AND column_name='payment_confirmed_at') THEN
        ALTER TABLE pix_orders ADD COLUMN payment_confirmed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Adicionar admin_reviewed_at se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pix_orders' AND column_name='admin_reviewed_at') THEN
        ALTER TABLE pix_orders ADD COLUMN admin_reviewed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Adicionar admin_review_notes se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pix_orders' AND column_name='admin_review_notes') THEN
        ALTER TABLE pix_orders ADD COLUMN admin_review_notes TEXT;
    END IF;
    
    -- Adicionar payment_status se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pix_orders' AND column_name='payment_status') THEN
        ALTER TABLE pix_orders ADD COLUMN payment_status TEXT DEFAULT 'waiting_payment';
    END IF;
END
$$;

-- Atualizar registros existentes para ter o payment_status correto
UPDATE pix_orders 
SET payment_status = CASE 
    WHEN status = 'pagado' THEN 'approved'
    WHEN status = 'cancelado' THEN 'rejected'
    ELSE 'waiting_payment'
END
WHERE payment_status IS NULL;

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger se não existir
DROP TRIGGER IF EXISTS update_pix_orders_updated_at ON pix_orders;
CREATE TRIGGER update_pix_orders_updated_at
    BEFORE UPDATE ON pix_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Criar/atualizar políticas RLS para permitir que usuários vejam e atualizem seus próprios pedidos
DROP POLICY IF EXISTS "Usuários podem ver seus próprios pedidos" ON pix_orders;
CREATE POLICY "Usuários podem ver seus próprios pedidos" ON pix_orders
    FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios pedidos" ON pix_orders;
CREATE POLICY "Usuários podem atualizar seus próprios pedidos" ON pix_orders
    FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios pedidos" ON pix_orders;
CREATE POLICY "Usuários podem inserir seus próprios pedidos" ON pix_orders
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Política para admins (assumindo que existe uma tabela admins)
DROP POLICY IF EXISTS "Admins podem gerenciar todos os pedidos" ON pix_orders;
CREATE POLICY "Admins podem gerenciar todos os pedidos" ON pix_orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    );

-- Habilitar RLS se não estiver habilitado
ALTER TABLE pix_orders ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE pix_orders IS 'Tabela de pedidos PIX com suporte para upload de comprovantes de pagamento';
COMMENT ON COLUMN pix_orders.payment_proof_file IS 'Comprovante de pagamento em formato Base64';
COMMENT ON COLUMN pix_orders.payment_status IS 'Status: waiting_payment, waiting_review, approved, rejected';