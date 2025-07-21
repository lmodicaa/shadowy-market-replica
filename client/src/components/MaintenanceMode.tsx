import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Settings, Clock } from 'lucide-react';
import StarField from '@/components/StarField';

interface MaintenanceModeProps {
  children: React.ReactNode;
  userIsAdmin?: boolean;
}

// Hook para verificar se o modo de manutenção está ativo
const useMaintenanceMode = () => {
  return useQuery({
    queryKey: ['maintenanceMode'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('key', 'maintenance_mode')
          .maybeSingle(); // Use maybeSingle ao invés de single para evitar erro quando não existe
        
        if (error) {
          console.error('Erro ao verificar modo de manutenção:', error);
          return false; // Em caso de erro, assumir que não está em manutenção
        }
        
        return data?.value === 'true';
      } catch (error) {
        console.error('Erro na conexão com Supabase:', error);
        return false; // Em caso de erro de conexão, assumir que não está em manutenção
      }
    },
    refetchInterval: 10000, // Verifica a cada 10 segundos para resposta mais rápida
    staleTime: 5000, // Cache por apenas 5 segundos
    retry: false, // Não tentar novamente em caso de erro para evitar loops
  });
};

// Hook para obter a mensagem de manutenção
const useMaintenanceMessage = () => {
  return useQuery({
    queryKey: ['maintenanceMessage'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('key', 'maintenance_message')
          .maybeSingle();
        
        if (error) {
          console.error('Erro ao obter mensagem de manutenção:', error);
          return 'O site está em manutenção. Voltaremos em breve!';
        }
        
        return data?.value || 'O site está em manutenção. Voltaremos em breve!';
      } catch (error) {
        console.error('Erro na conexão com Supabase para mensagem:', error);
        return 'O site está em manutenção. Voltaremos em breve!';
      }
    },
    retry: false, // Não tentar novamente em caso de erro
  });
};

const MaintenanceScreen = ({ message }: { message: string }) => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StarField />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-lg w-full border-amber-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Settings className="w-16 h-16 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                <AlertTriangle className="w-8 h-8 text-amber-600 absolute -top-1 -right-1" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-4 text-foreground">
              Site em Manutenção
            </h1>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {message}
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Tempo estimado: Em breve</span>
            </div>
            

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const MaintenanceMode = ({ children, userIsAdmin = false }: MaintenanceModeProps) => {
  const { data: isMaintenanceMode, isLoading: isLoadingMaintenance } = useMaintenanceMode();
  const { data: maintenanceMessage } = useMaintenanceMessage();



  // Mostrar carregamento apenas brevemente
  if (isLoadingMaintenance) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cloud-blue"></div>
      </div>
    );
  }

  // Se o modo de manutenção está ativo e o usuário não é admin, mostrar tela de manutenção
  if (isMaintenanceMode && !userIsAdmin) {

    return <MaintenanceScreen message={maintenanceMessage || 'O site está em manutenção. Voltaremos em breve!'} />;
  }

  // Caso contrário, renderizar o conteúdo normal

  return <>{children}</>;
};

export default MaintenanceMode;