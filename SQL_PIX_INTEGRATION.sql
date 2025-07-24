-- SQL para integrar sistema de pagos Pix con planes
-- Ejecutar en Supabase Dashboard -> SQL Editor

-- 1. Crear tabla para pedidos Pix integrada con planes
CREATE TABLE IF NOT EXISTS pix_orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    plan_id UUID REFERENCES plans(id), -- Referencia al plan siendo comprado
    plan_name TEXT,
    amount TEXT, -- Valor como string para manter formato (ex: "29.90")
    description TEXT,
    status TEXT CHECK (status IN ('pendiente', 'pagado', 'cancelado')) DEFAULT 'pendiente',
    pix_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_pix_orders_user_id ON pix_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_pix_orders_plan_id ON pix_orders(plan_id);
CREATE INDEX IF NOT EXISTS idx_pix_orders_status ON pix_orders(status);
CREATE INDEX IF NOT EXISTS idx_pix_orders_created_at ON pix_orders(created_at DESC);

-- 3. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_pix_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Trigger para actualizar updated_at cuando se modifica un registro
DROP TRIGGER IF EXISTS update_pix_orders_updated_at ON pix_orders;
CREATE TRIGGER update_pix_orders_updated_at
    BEFORE UPDATE ON pix_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_pix_orders_updated_at();

-- 5. Habilitar RLS (Row Level Security) para seguridad
ALTER TABLE pix_orders ENABLE ROW LEVEL SECURITY;

-- 6. Política para que los usuarios solo puedan ver sus propios pedidos
CREATE POLICY "Users can view own pix orders" ON pix_orders
    FOR SELECT USING (auth.uid()::TEXT = user_id);

-- 7. Política para que los administradores puedan ver todos los pedidos
CREATE POLICY "Admins can manage all pix orders" ON pix_orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()::TEXT 
            AND (profiles.role = 'admin' OR profiles.is_admin = true)
        )
    );

-- 8. Política alternativa simple si no tienes tabla de roles
-- (Comentada por defecto, descomenta si necesaria)
-- CREATE POLICY "Allow all for authenticated users" ON pix_orders
--     FOR ALL USING (auth.role() = 'authenticated');

-- 9. Crear algunos datos de ejemplo para probar (opcional)
INSERT INTO pix_orders (id, user_id, plan_id, plan_name, amount, description, status) VALUES
('PIX_EXEMPLO_001', 'user-test-123', (SELECT id FROM plans WHERE name = 'Básico' LIMIT 1), 'Básico', '29.90', 'Plan Básico - 30 dias de acesso', 'pendiente'),
('PIX_EXEMPLO_002', 'user-test-456', (SELECT id FROM plans WHERE name = 'Gamer' LIMIT 1), 'Gamer', '59.90', 'Plan Gamer - 30 dias de acesso', 'pendiente')
ON CONFLICT (id) DO NOTHING;

-- 10. Verificar que todo se creó correctamente
SELECT 'Tabela pix_orders criada com sucesso!' as resultado;
SELECT COUNT(*) as total_pedidos FROM pix_orders;

-- 11. Ver estructura de la tabla
\d pix_orders;

-- 12. Ver políticas RLS
SELECT schemaname, tablename, policyname, cmd, qual FROM pg_policies WHERE tablename = 'pix_orders';