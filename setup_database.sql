-- SQL para configurar o banco de dados com as tabelas necessárias
-- Execute este código no seu Supabase SQL Editor

-- 1. Criar tabela admin_settings se não existir
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inserir configurações padrão do sistema (incluindo modo de manutenção)
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

-- 3. Criar outras tabelas necessárias se não existirem
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active_plan UUID,
    active_plan_until TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    price TEXT NOT NULL,
    price_numeric INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    plan_name TEXT NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plan_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id),
    available_slots INTEGER NOT NULL DEFAULT 0,
    total_slots INTEGER NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin',
    permissions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Inserir planos padrão se não existirem
INSERT INTO plans (name, price, price_numeric, description) VALUES 
('Básico', 'R$ 49', 4900, 'Ideal para jogos casuais'),
('Gamer', 'R$ 99', 9900, 'Perfeito para gamers intermediários'),
('Pro', 'R$ 199', 19900, 'Para profissionais e streamers')
ON CONFLICT (name) DO NOTHING;

-- 5. Configurar estoque inicial dos planos
INSERT INTO plan_stock (plan_id, available_slots, total_slots, is_available) 
SELECT p.id, 50, 100, true 
FROM plans p 
WHERE p.name = 'Básico'
ON CONFLICT DO NOTHING;

INSERT INTO plan_stock (plan_id, available_slots, total_slots, is_available) 
SELECT p.id, 30, 50, true 
FROM plans p 
WHERE p.name = 'Gamer'
ON CONFLICT DO NOTHING;

INSERT INTO plan_stock (plan_id, available_slots, total_slots, is_available) 
SELECT p.id, 20, 25, true 
FROM plans p 
WHERE p.name = 'Pro'
ON CONFLICT DO NOTHING;

-- 6. Configurar políticas RLS (Row Level Security) se necessário
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 7. Políticas básicas de leitura pública (ajuste conforme necessário)
CREATE POLICY "Allow public read access to admin_settings" ON admin_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to plans" ON plans
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to plan_stock" ON plan_stock
    FOR SELECT USING (true);

-- 8. Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 9. Função para testar conexão (opcional)
CREATE OR REPLACE FUNCTION test_database_connection()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN 'Database connection successful!';
END;
$$;