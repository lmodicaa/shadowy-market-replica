-- SQL para corregir la base de datos MateCloud
-- Ejecuta este código completo en tu Supabase SQL Editor

-- 1. Crear tabla admin_settings para modo de manutenção
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insertar configuraciones básicas
INSERT INTO admin_settings (key, value, description) VALUES 
('maintenance_mode', 'false', 'Ativar modo de manutenção'),
('maintenance_message', 'Sistema em manutenção. Voltamos em breve!', 'Mensagem durante manutenção'),
('site_name', 'MateCloud', 'Nome do site')
ON CONFLICT (key) DO NOTHING;

-- 3. Verificar que la tabla plans tiene el campo stock
ALTER TABLE plans ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- 4. Dar valores iniciales de stock si están vacíos
UPDATE plans SET stock = 50 WHERE stock IS NULL OR stock = 0;

-- 5. Habilitar RLS si no está habilitado
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 6. Eliminar políticas anteriores y crear nuevas
DROP POLICY IF EXISTS "Enable read access for all users" ON plans;
DROP POLICY IF EXISTS "Enable all access for all users" ON plans;
DROP POLICY IF EXISTS "Allow public read access to plans" ON plans;
DROP POLICY IF EXISTS "Allow admin operations on plans" ON plans;

CREATE POLICY "plans_select_policy" ON plans FOR SELECT USING (true);
CREATE POLICY "plans_all_policy" ON plans FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON admin_settings;
DROP POLICY IF EXISTS "Enable all access for all users" ON admin_settings;
DROP POLICY IF EXISTS "Allow public read access to admin_settings" ON admin_settings;
DROP POLICY IF EXISTS "Allow admin operations on admin_settings" ON admin_settings;

CREATE POLICY "admin_settings_select_policy" ON admin_settings FOR SELECT USING (true);
CREATE POLICY "admin_settings_all_policy" ON admin_settings FOR ALL USING (true);

-- 7. Verificar que todo está funcionando
SELECT 'Configuración completada correctamente' AS status;
SELECT 'Plans:' as tipo, name, stock FROM plans;
SELECT 'Settings:' as tipo, key, value FROM admin_settings;