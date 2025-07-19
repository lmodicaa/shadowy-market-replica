# Configuração do Painel Administrativo

Para ativar completamente o painel administrativo, você precisa criar as seguintes tabelas no Supabase:

## 1. Tabela de Configurações Administrativas

```sql
-- Criar tabela de configurações administrativas
CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT INTO admin_settings (key, value, description) VALUES
('site_name', 'MateCloud', 'Nome do site exibido na interface'),
('site_description', 'A melhor plataforma de cloud gaming do Brasil', 'Descrição do site para SEO'),
('maintenance_mode', 'false', 'Ativar modo de manutenção'),
('maintenance_message', 'O site está em manutenção. Voltaremos em breve!', 'Mensagem exibida durante manutenção'),
('max_concurrent_users', '100', 'Máximo de usuários simultâneos'),
('default_plan_duration', '30', 'Duração padrão dos planos em dias'),
('support_email', 'suporte@matecloud.com.br', 'Email de suporte técnico'),
('enable_registrations', 'true', 'Permitir novos registros'),
('stock_low_threshold', '5', 'Limite para alerta de estoque baixo'),
('stock_empty_message', 'Este plano está temporariamente indisponível. Tente novamente mais tarde.', 'Mensagem quando estoque esgotado'),
('vm_default_password', 'matecloud123', 'Senha padrão das VMs'),
('vm_session_timeout', '60', 'Timeout das sessões de VM (minutos)')
ON CONFLICT (key) DO NOTHING;
```

## 2. Tabela de Estoque de Planos

```sql
-- Criar tabela de estoque de planos
CREATE TABLE IF NOT EXISTS plan_stock (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL,
  available_slots INTEGER NOT NULL DEFAULT 0,
  total_slots INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir estoque inicial dos planos
INSERT INTO plan_stock (plan_id, available_slots, total_slots, is_available) VALUES
(1, 50, 100, true),  -- Plano Básico
(2, 30, 50, true),   -- Plano Gamer
(3, 15, 20, true)    -- Plano Pro
ON CONFLICT DO NOTHING;
```

## 3. Tabela de Administradores

```sql
-- Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 4. Como adicionar um administrador

Para tornar um usuário administrador, primeiro ele precisa fazer login na aplicação. Depois, execute:

```sql
-- Substitua 'USER_ID_AQUI' pelo ID real do usuário (visível na página de perfil)
INSERT INTO admins (user_id, role, permissions) VALUES
('USER_ID_AQUI', 'admin', ARRAY['user_management', 'plan_management', 'system_settings']);
```

## 5. Recursos do Painel Admin

### Gerenciamento de Usuários
- Visualizar todos os usuários registrados
- Editar planos ativos de usuários
- Definir duração de planos
- Excluir usuários
- Ver histórico de assinaturas

### Gerenciamento de Planos
- Controlar estoque de cada plano
- Definir slots disponíveis e totais
- Ativar/desativar planos
- Configurar mensagens de estoque esgotado
- Alertas de estoque baixo

### Configurações do Sistema
- Configurações gerais (nome do site, descrição, email de suporte)
- Modo de manutenção
- Limites de usuários simultâneos
- Configurações de VM (senha padrão, timeout)
- Controle de registros

### Estatísticas
- Total de usuários e assinaturas ativas
- Receita mensal estimada
- Distribuição por planos
- Usuários e assinaturas recentes
- Status do sistema

## 6. Acesso ao Painel

Após criar as tabelas e adicionar um usuário como admin:

1. Faça login na aplicação
2. Clique no seu avatar no canto superior direito
3. Selecione "Painel Admin" no menu
4. Você terá acesso completo às funcionalidades administrativas

## Notas de Segurança

- Apenas usuários adicionados à tabela `admins` podem acessar o painel
- O sistema verifica automaticamente as permissões
- Todas as operações administrativas são registradas
- As configurações são sincronizadas em tempo real