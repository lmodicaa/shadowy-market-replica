import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Hook para buscar configurações do sistema
export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .order('key');
      
      if (error) {
        console.error('Erro ao buscar configurações:', error);
        // Retornar configurações padrão em caso de erro
        return {
          site_name: 'MateCloud',
          site_description: 'A melhor plataforma de cloud gaming do Brasil',
          support_email: 'suporte@matecloud.com.br',
          discord_invite: 'https://discord.gg/matecloud',
          maintenance_mode: 'false',
          maintenance_message: 'O site está em manutenção. Voltaremos em breve!',
        };
      }
      
      // Converter array de configurações em objeto
      const settingsMap: Record<string, string> = {};
      data?.forEach(setting => {
        settingsMap[setting.key] = setting.value;
      });
      
      // Garantir que sempre temos valores padrão
      const defaultSettings = {
        site_name: 'MateCloud',
        site_description: 'A melhor plataforma de cloud gaming do Brasil',
        support_email: 'suporte@matecloud.com.br',
        discord_invite: 'https://discord.gg/matecloud',
        maintenance_mode: 'false',
        maintenance_message: 'O site está em manutenção. Voltaremos em breve!',
        max_concurrent_users: '100',
        default_plan_duration: '30',
        stock_low_threshold: '5',
        stock_empty_message: 'Este plano está temporariamente indisponível.',
        vm_default_password: 'matecloud123',
        vm_session_timeout: '60',
      };
      
      return { ...defaultSettings, ...settingsMap };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook específico para obter uma configuração específica
export const useSetting = (key: string) => {
  const { data: settings, isLoading, error } = useSettings();
  
  return {
    value: settings ? (settings as Record<string, string>)[key] : undefined,
    isLoading,
    error
  };
};