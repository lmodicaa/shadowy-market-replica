-- SQL para adicionar campos de QR code e tipo PIX na tabela pix_orders
-- Execute no Supabase Dashboard > SQL Editor

-- 1. Adicionar colunas para imagem QR e tipo PIX
ALTER TABLE pix_orders 
ADD COLUMN IF NOT EXISTS pix_qr_image TEXT,
ADD COLUMN IF NOT EXISTS pix_type TEXT CHECK (pix_type IN ('text', 'qr')) DEFAULT 'text';

-- 2. Atualizar registros existentes que tenham pix_code para tipo 'text'
UPDATE pix_orders 
SET pix_type = 'text' 
WHERE pix_code IS NOT NULL AND pix_type IS NULL;

-- 3. Verificar estrutura da tabela atualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'pix_orders'
ORDER BY ordinal_position;

-- 4. Verificar dados existentes
SELECT 
    id, 
    status, 
    pix_type,
    CASE 
        WHEN pix_code IS NOT NULL THEN 'HAS_TEXT'
        ELSE 'NO_TEXT'
    END as has_pix_code,
    CASE 
        WHEN pix_qr_image IS NOT NULL THEN 'HAS_QR'
        ELSE 'NO_QR'
    END as has_qr_image,
    created_at
FROM pix_orders
ORDER BY created_at DESC
LIMIT 10;