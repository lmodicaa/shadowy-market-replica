-- SQL actualizado para la estructura de tu base de datos
-- Execute este código no seu Supabase SQL Editor

-- 1. Crear tabla admin_settings si no existe
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insertar configurações padrão do sistema
INSERT INTO admin_settings (key, value, description) VALUES 
('site_name', 'MateCloud', 'Nome do site exibido na interface'),
('site_description', 'A melhor plataforma de cloud gaming do Brasil', 'Descrição do site para SEO'),
('maintenance_mode', 'false', 'Ativar modo de manutenção'),
('maintenance_message', 'O site está em manutenção. Voltaremos em breve!', 'Mensagem exibida durante manutenção'),
('max_concurrent_users', '100', 'Máximo de usuários simultâneos'),
('default_plan_duration', '30', 'Duração padrão dos planos em dias'),
('support_email', 'suporte@matecloud.com.br', 'Email de suporte técnico'),
('discord_invite', 'https://discord.gg/matecloud', 'Link do convite do Discord'),
('enable_registrations', 'true', 'Permitir novos registros'),
('stock_low_threshold', '5', 'Limite para alerta de estoque baixo'),
('stock_empty_message', 'Este plano está temporariamente indisponível.', 'Mensagem quando estoque esgotado'),
('vm_default_password', 'matecloud123', 'Senha padrão das VMs'),
('vm_session_timeout', '60', 'Timeout das sessões de VM (minutos)')
ON CONFLICT (key) DO NOTHING;

-- 3. Atualizar dados da tabela plans se ela já existe
-- Adicionar alguns valores de stock se não existem
UPDATE plans SET stock = 50 WHERE name = 'Básico' AND stock IS NULL;
UPDATE plans SET stock = 30 WHERE name = 'Gamer' AND stock IS NULL;
UPDATE plans SET stock = 20 WHERE name = 'Pro' AND stock IS NULL;

-- 4. Configurar RLS e políticas
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de acesso
DROP POLICY IF EXISTS "Allow public read access to admin_settings" ON admin_settings;
CREATE POLICY "Allow public read access to admin_settings" ON admin_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to plans" ON plans;
CREATE POLICY "Allow public read access to plans" ON plans
    FOR SELECT USING (true);

-- 6. Políticas para operações de escrita
DROP POLICY IF EXISTS "Allow admin operations on admin_settings" ON admin_settings;
CREATE POLICY "Allow admin operations on admin_settings" ON admin_settings
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow admin operations on plans" ON plans;
CREATE POLICY "Allow admin operations on plans" ON plans
    FOR ALL USING (true);

-- 7. Función de teste (opcional)
CREATE OR REPLACE FUNCTION test_database_connection()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN 'Database connection successful! Plans table with stock field is ready.';
END;
$$;