import { supabase } from '@/lib/supabase';

// Configurações padrão do sistema (apenas essenciais)
const defaultSettings = [
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
    key: 'stock_low_threshold',
    value: '5',
    description: 'Limite para alerta de estoque baixo'
  },
  {
    key: 'stock_empty_message',
    value: 'Este plano está temporariamente indisponível.',
    description: 'Mensagem quando estoque esgotado'
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

      
      const { data, error } = await supabase
        .from('admin_settings')
        .insert(settingsToInsert.map(setting => ({
          ...setting,
          updated_at: new Date().toISOString()
        })));
      
      if (error) {
        console.error('Erro ao inserir configurações padrão:', error);
      } else {

      }
    } else {

    }
    
  } catch (error) {
    console.error('Erro na inicialização das configurações:', error);
  }
};