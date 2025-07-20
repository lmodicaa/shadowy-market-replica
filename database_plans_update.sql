-- SQL para actualizar la estructura de la tabla plans y agregar datos de ejemplo

-- 1. Agregar las nuevas columnas a la tabla plans (si no existen)
ALTER TABLE plans ADD COLUMN IF NOT EXISTS ram TEXT NOT NULL DEFAULT '4 GB';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS cpu TEXT NOT NULL DEFAULT '2 vCPUs';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS storage TEXT NOT NULL DEFAULT '50 GB';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS gpu TEXT NOT NULL DEFAULT 'Compartilhada';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_resolution TEXT NOT NULL DEFAULT '1080p';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Offline';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- 2. Limpiar dados existentes (opcional, descomente se quiere empezar limpio)
-- DELETE FROM subscriptions;
-- DELETE FROM plans;

-- 3. Insertar planes de ejemplo con especificaciones completas
INSERT INTO plans (
    id, name, stock, price, description, ram, cpu, storage, gpu, max_resolution, status
) VALUES 
-- Plan Básico
(
    '38a99fdf-e8c3-40cb-a52a-c1b1b3d33ff0',
    'Plan Básico',
    15,
    'R$ 49',
    'Ideal para jogos casuais e usuarios iniciantes',
    '4 GB',
    '2 vCPUs',
    '50 GB',
    'Compartilhada',
    '1080p',
    'Online'
),
-- Plan Gamer
(
    'f9d5ac77-7142-421c-aae2-6f9735d52c53',
    'Plan Gamer',
    8,
    'R$ 99',
    'Perfeito para gamers intermediários com performance dedicada',
    '8 GB',
    '4 vCPUs',
    '100 GB',
    'GTX 1060',
    '1440p',
    'Online'
),
-- Plan Pro
(
    '6681e2f0-f1bd-4201-b15a-6c8c24e4c73b',
    'Plan Pro',
    3,
    'R$ 199',
    'Para profissionais e streamers que precisam de máximo desempenho',
    '16 GB',
    '8 vCPUs',
    '250 GB',
    'RTX 3070',
    '4K',
    'Online'
),
-- Plan Premium (novo)
(
    gen_random_uuid(),
    'Plan Premium',
    2,
    'R$ 299',
    'O melhor que oferecemos para uso corporativo e desenvolvimento',
    '32 GB',
    '16 vCPUs',
    '500 GB',
    'RTX 4080',
    '4K',
    'Online'
),
-- Plan Estudante (novo)
(
    gen_random_uuid(),
    'Plan Estudante',
    20,
    'R$ 29',
    'Preço especial para estudantes e uso educacional',
    '2 GB',
    '1 vCPU',
    '25 GB',
    'Integrada',
    '720p',
    'Online'
)
ON CONFLICT (id) DO UPDATE SET
    stock = EXCLUDED.stock,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    ram = EXCLUDED.ram,
    cpu = EXCLUDED.cpu,
    storage = EXCLUDED.storage,
    gpu = EXCLUDED.gpu,
    max_resolution = EXCLUDED.max_resolution,
    status = EXCLUDED.status;

-- 4. Verificar os dados inseridos
SELECT id, name, stock, price, description, ram, cpu, storage, gpu, max_resolution, status 
FROM plans 
ORDER BY name;