import { supabase } from '@/lib/supabase';

// Configurações padrão do sistema
const defaultSettings = [
  {
    key: 'site_name',
    value: 'MateCloud',
    description: 'Nome do site exibido na interface'
  },
  {
    key: 'site_description', 
    value: 'A melhor plataforma de cloud gaming do Brasil',
    description: 'Descrição do site para SEO'
  },
  {
    key: 'maintenance_mode',
    value: 'false',
    description: 'Ativar modo de manutenção'
  },
  {
    key: 'maintenance_message',
    value: 'O site está em manutenção. Voltaremos em breve!',
    description: 'Mensagem exibida durante manutenção'
  },
  {
    key: 'max_concurrent_users',
    value: '100',
    description: 'Máximo de usuários simultâneos'
  },
  {
    key: 'default_plan_duration',
    value: '30',
    description: 'Duração padrão dos planos em dias'
  },
  {
    key: 'support_email',
    value: 'suporte@matecloud.com.br',
    description: 'Email de suporte técnico'
  },
  {
    key: 'discord_invite',
    value: 'https://discord.gg/matecloud',
    description: 'Link do convite do Discord'
  },
  {
    key: 'enable_registrations',
    value: 'true',
    description: 'Permitir novos registros'
  },
  {
    key: 'stock_low_threshold',
    value: '5',
    description: 'Limite para alerta de estoque baixo'
  },
  {
    key: 'stock_empty_message',
    value: 'Este plano está temporariamente indisponível.',
    description: 'Mensagem quando estoque esgotado'
  },
  {
    key: 'vm_default_password',
    value: 'matecloud123',
    description: 'Senha padrão das VMs'
  },
  {
    key: 'vm_session_timeout',
    value: '60',
    description: 'Timeout das sessões de VM (minutos)'
  }
];

export const initializeAdminSettings = async () => {
  try {

    
    // Verificar quais configurações já existem
    const { data: existingSettings, error: selectError } = await supabase
      .from('admin_settings')
      .select('key');
    
    if (selectError) {
      console.error('Erro ao verificar configurações existentes:', selectError);
      return;
    }
    
    const existingKeys = existingSettings?.map(s => s.key) || [];
    
    // Inserir apenas as configurações que não existem
    const settingsToInsert = defaultSettings.filter(setting => 
      !existingKeys.includes(setting.key)
    );
    
    if (settingsToInsert.length > 0) {
      console.log('Inserindo configurações faltantes:', settingsToInsert.map(s => s.key));
      
      const { data, error } = await supabase
        .from('admin_settings')
        .insert(settingsToInsert.map(setting => ({
          ...setting,
          updated_at: new Date().toISOString()
        })));
      
      if (error) {
        console.error('Erro ao inserir configurações padrão:', error);
      } else {
        console.log('Configurações padrão inseridas com sucesso');
      }
    } else {
      console.log('Todas as configurações padrão já existem');
    }
    
  } catch (error) {
    console.error('Erro na inicialização das configurações:', error);
  }
};