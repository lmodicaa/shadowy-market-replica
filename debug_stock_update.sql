-- SQL para debuggear el problema de actualización de stock
-- Ejecuta esto antes y después de intentar actualizar el stock

-- 1. Ver el estado actual de la tabla plans
SELECT 
    'BEFORE UPDATE' as momento,
    id, 
    name, 
    price, 
    description, 
    stock,
    created_at,
    updated_at
FROM plans 
ORDER BY name;

-- 2. Hacer una actualización de prueba manual
UPDATE plans 
SET stock = 999 
WHERE name = 'Básico';

-- 3. Verificar que la actualización funcionó
SELECT 
    'AFTER MANUAL UPDATE' as momento,
    id, 
    name, 
    price, 
    description, 
    stock,
    created_at,
    updated_at
FROM plans 
WHERE name = 'Básico';

-- 4. Revertir la actualización de prueba
UPDATE plans 
SET stock = 50 
WHERE name = 'Básico';

-- 5. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'plans';

-- 6. Verificar que RLS está habilitado
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'plans';