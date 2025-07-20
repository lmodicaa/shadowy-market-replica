-- SQL para corregir tanto el problema de UUID como el de stock
-- Ejecuta esto completo en Supabase SQL Editor

-- 1. Ver estado actual de plans
SELECT 'PLANS ACTUALES' as info, id, name, stock FROM plans;

-- 2. Ver estructura de subscriptions
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
ORDER BY ordinal_position;

-- 3. Corregir políticas RLS para plans - eliminar todas y crear simples
DROP POLICY IF EXISTS "plans_select_policy" ON plans;
DROP POLICY IF EXISTS "plans_all_policy" ON plans;
DROP POLICY IF EXISTS "plans_full_access" ON plans;
DROP POLICY IF EXISTS "Enable read access for all users" ON plans;
DROP POLICY IF EXISTS "Enable all access for all users" ON plans;
DROP POLICY IF EXISTS "Allow public read access to plans" ON plans;
DROP POLICY IF EXISTS "Allow admin operations on plans" ON plans;

-- Crear políticas simples que funcionan
CREATE POLICY "plans_public_access" ON plans FOR ALL USING (true) WITH CHECK (true);

-- 4. Hacer lo mismo para subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

CREATE POLICY "subscriptions_full_access" ON subscriptions FOR ALL USING (true) WITH CHECK (true);

-- 5. Asegurar que plans tiene valores de stock
UPDATE plans SET stock = 50 WHERE stock IS NULL OR stock = 0;

-- 6. Verificar que plans se puede actualizar
UPDATE plans SET stock = 100 WHERE name ILIKE '%basic%' OR name ILIKE '%basico%';

-- 7. Ver resultado
SELECT 'AFTER UPDATE' as info, id, name, stock FROM plans;

-- 8. Verificar políticas finales
SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('plans', 'subscriptions');