-- Supabase Database Setup for SpaceHost Admin Panel
-- Execute these commands in your Supabase SQL editor

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active_plan TEXT,
    active_plan_until TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    price TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id),
    plan_id INTEGER NOT NULL REFERENCES plans(id),
    plan_name TEXT NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_settings (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plan_stock (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL REFERENCES plans(id),
    available_slots INTEGER NOT NULL DEFAULT 0,
    total_slots INTEGER NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id),
    role TEXT NOT NULL DEFAULT 'admin',
    permissions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial data
INSERT INTO plans (name, price, description) VALUES 
('Básico', 'R$ 49', 'Ideal para jogos casuais'),
('Gamer', 'R$ 99', 'Perfeito para gamers intermediários'),
('Pro', 'R$ 199', 'Para profissionais e streamers')
ON CONFLICT (name) DO NOTHING;

-- Create initial plan stock
INSERT INTO plan_stock (plan_id, available_slots, total_slots, is_available) VALUES 
(1, 50, 100, true),
(2, 30, 50, true),
(3, 20, 25, true)
ON CONFLICT DO NOTHING;

-- Create initial admin settings
INSERT INTO admin_settings (key, value, description) VALUES 
('site_name', 'SpaceHost', 'Nome do site exibido na interface'),
('site_description', 'Hospedagem de VMs no espaço', 'Descrição do site para SEO'),
('maintenance_mode', 'false', 'Ativar modo de manutenção'),
('maintenance_message', 'Sistema em manutenção. Voltamos em breve!', 'Mensagem exibida durante manutenção'),
('max_concurrent_users', '1000', 'Máximo de usuários simultâneos'),
('default_plan_duration', '30', 'Duração padrão dos planos em dias'),
('support_email', 'suporte@spacehost.com', 'Email de suporte técnico'),
('discord_invite', 'https://discord.gg/spacehost', 'Link do convite do Discord'),
('enable_registrations', 'true', 'Permitir novos registros'),
('stock_low_threshold', '10', 'Limite para alerta de estoque baixo'),
('stock_empty_message', 'Este plano está temporariamente esgotado', 'Mensagem quando estoque esgotado'),
('vm_default_password', 'SpaceVM123!', 'Senha padrão das VMs'),
('vm_session_timeout', '240', 'Timeout das sessões de VM (minutos)')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to plans
CREATE POLICY "Allow public read access to plans" ON plans FOR SELECT USING (true);
CREATE POLICY "Allow public read access to plan_stock" ON plan_stock FOR SELECT USING (true);

-- Create policies for authenticated users to read their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for admin access
CREATE POLICY "Admins can view all data" ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage subscriptions" ON subscriptions FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage admin_settings" ON admin_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage plan_stock" ON plan_stock FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);
CREATE POLICY "Super admins can manage admins" ON admins FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'preferred_username',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();