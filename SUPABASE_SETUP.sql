-- Configuração das políticas RLS para Netlify
-- Execute estes comandos no SQL Editor do Supabase

-- 1. Habilitar RLS na tabela plans
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- 2. Política para leitura pública dos planos online
CREATE POLICY "Public read access for online plans" ON plans
FOR SELECT USING (status = 'Online');

-- 3. Verificar se a tabela está criada corretamente
-- Se não existir, criar a tabela plans:
/*
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  stock INTEGER,
  price TEXT NOT NULL,
  description TEXT,
  ram TEXT NOT NULL,
  cpu TEXT NOT NULL,
  storage TEXT NOT NULL,
  gpu TEXT NOT NULL,
  max_resolution TEXT NOT NULL,
  status TEXT DEFAULT 'Offline',
  duration INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- 4. Inserir dados de exemplo (opcional)
INSERT INTO plans (name, stock, price, description, ram, cpu, storage, gpu, max_resolution, status, duration) VALUES
('Básico', 10, 'R$ 29,90', 'Ideal para uso básico e desenvolvimento', '4 GB', '2 vCPUs', '50 GB', 'Integrada', '1080p', 'Online', 30),
('Gamer', 5, 'R$ 59,90', 'Perfeito para gaming e aplicações médias', '8 GB', '4 vCPUs', '100 GB', 'GTX 1060', '1440p', 'Online', 30),
('Pro', 3, 'R$ 99,90', 'Máxima performance para profissionais', '16 GB', '8 vCPUs', '250 GB', 'RTX 3070', '4K', 'Online', 30)
ON CONFLICT (name) DO NOTHING;

-- 5. Política para outras tabelas (se necessário)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for admin settings" ON admin_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update admin settings" ON admin_settings FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM admins));

-- 6. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('plans', 'profiles', 'subscriptions', 'admin_settings');