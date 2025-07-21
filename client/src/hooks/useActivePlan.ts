import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Hook para verificar se o usuário tem plano ativo
export const useActivePlan = (userId?: string) => {
  return useQuery({
    queryKey: ['activePlan', userId],
    queryFn: async () => {
      if (!userId) return null;
      

      
      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('active_plan, active_plan_until')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.log('Perfil não encontrado:', profileError);
        return null;
      }
      
      // Verificar se tem plano ativo e não vencido
      if (profile?.active_plan && profile?.active_plan_until) {
        const endDate = new Date(profile.active_plan_until);
        const now = new Date();
        
        if (endDate > now) {
          // Buscar detalhes do plano
          const { data: planDetails, error: planError } = await supabase
            .from('plans')
            .select('name, price, description')
            .eq('id', profile.active_plan)
            .single();
          
          if (!planError && planDetails) {
            const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            return {
              ...planDetails,
              planName: planDetails.name, // Para compatibilidade com UserPlanStatus
              expirationDate: profile.active_plan_until,
              endDate: profile.active_plan_until, // Para compatibilidade com PlansSection
              daysRemaining,
              isActive: true,
              isExpired: false
            };
          }
        } else {
          // Plano expirado
          const { data: planDetails, error: planError } = await supabase
            .from('plans')
            .select('name, price, description')
            .eq('id', profile.active_plan)
            .single();
          
          if (!planError && planDetails) {
            return {
              ...planDetails,
              planName: planDetails.name,
              expirationDate: profile.active_plan_until,
              endDate: profile.active_plan_until,
              daysRemaining: 0,
              isActive: false,
              isExpired: true
            };
          }
        }
      }
      
      return null;
    },
    enabled: !!userId,
  });
};

// Hook para obter histórico de subscripcões
export const useSubscriptionHistory = (userId?: string) => {
  return useQuery({
    queryKey: ['subscriptionHistory', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar histórico:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!userId,
  });
};