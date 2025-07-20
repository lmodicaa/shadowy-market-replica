-- SQL para testar validação de planos ativos
-- Execute em partes para verificar se a validação está funcionando

-- 1. Verificar estrutura das tabelas
SELECT 'ESTRUTURA PROFILES' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('id', 'active_plan', 'active_plan_until')
ORDER BY ordinal_position;

SELECT 'ESTRUTURA PLANS' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'plans' 
AND column_name IN ('id', 'name', 'stock')
ORDER BY ordinal_position;

-- 2. Ver dados atuais
SELECT 'PLANOS DISPONÍVEIS' as info;
SELECT id, name, price, stock FROM plans ORDER BY name;

SELECT 'PERFIS COM PLANOS ATIVOS' as info;
SELECT 
    p.id,
    p.email,
    p.active_plan,
    p.active_plan_until,
    pl.name as plan_name,
    CASE 
        WHEN p.active_plan_until > NOW() THEN 'ATIVO'
        ELSE 'EXPIRADO'
    END as status
FROM profiles p
LEFT JOIN plans pl ON p.active_plan = pl.id
WHERE p.active_plan IS NOT NULL;

-- 3. Ver subscripcões ativas
SELECT 'SUBSCRIPCÕES ATIVAS' as info;
SELECT 
    user_id,
    plan_name,
    start_date,
    end_date,
    CASE 
        WHEN end_date > NOW() THEN 'ATIVA'
        ELSE 'EXPIRADA'
    END as status
FROM subscriptions
WHERE end_date > NOW()
ORDER BY created_at DESC;

-- 4. Teste: Simular usuário com plano ativo
-- (NÃO executar se você tem dados reais - apenas para teste)
/*
-- Inserir usuário de teste
INSERT INTO profiles (id, email, active_plan_until) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'teste@email.com', NOW() + INTERVAL '30 days')
ON CONFLICT (id) DO UPDATE SET 
    active_plan_until = EXCLUDED.active_plan_until;

-- Associar plano ativo ao usuário
UPDATE profiles 
SET active_plan = (SELECT id FROM plans WHERE name = 'Básico' LIMIT 1)
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Verificar se funcionou
SELECT 'USUÁRIO TESTE' as info;
SELECT 
    p.id,
    p.email,
    p.active_plan,
    p.active_plan_until,
    pl.name as plan_name
FROM profiles p
LEFT JOIN plans pl ON p.active_plan = pl.id
WHERE p.id = '550e8400-e29b-41d4-a716-446655440000';
*/

SELECT 'VALIDAÇÃO PRONTA - TESTE NO FRONTEND' as status;