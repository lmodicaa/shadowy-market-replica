import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@shared/schema';

// Hook para obter o perfil do usuário
export const useUserProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar perfil:', error);
        throw error;
      }
      
      return data as Profile;
    },
    enabled: !!userId,
  });
};

// Hook para obter informações do plano ativo
export const useActivePlan = (userId?: string) => {
  return useQuery({
    queryKey: ['activePlan', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('active_plan, active_plan_until')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar plano ativo:', error);
        throw error;
      }
      
      if (!profile?.active_plan || !profile?.active_plan_until) {
        return null;
      }
      
      const now = new Date();
      const expirationDate = new Date(profile.active_plan_until);
      const isExpired = expirationDate < now;
      
      // Calcular dias restantes
      const timeDiff = expirationDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      return {
        planName: profile.active_plan,
        expirationDate: profile.active_plan_until,
        isExpired,
        daysRemaining: isExpired ? 0 : daysRemaining,
      };
    },
    enabled: !!userId,
    refetchInterval: 60000, // Refetch a cada minuto para manter atualizado
  });
};

// Hook para obter histórico de assinaturas
export const useSubscriptionHistory = (userId?: string) => {
  return useQuery({
    queryKey: ['subscriptions', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar histórico de assinaturas:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId,
  });
};

// Hook para atualizar perfil do usuário
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<Profile> }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Invalidar cache para atualizar dados
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
      queryClient.invalidateQueries({ queryKey: ['activePlan', data.id] });
    },
  });
};

// Hook para criar/atualizar assinatura
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      planName, 
      duration = 30 
    }: { 
      userId: string; 
      planName: string; 
      duration?: number; // dias
    }) => {
      const now = new Date();
      const endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
      
      // Primeiro buscar o ID real do plano - buscar exato e depois similar
      console.log('Buscando plano com nome:', planName);
      
      // Tentar busca exata primeiro
      let { data: plans, error: planError } = await supabase
        .from('plans')
        .select('id, name')
        .eq('name', planName);
      
      // Se não encontrar, tentar busca similar
      if (!plans || plans.length === 0) {
        console.log('Busca exata falhou, tentando busca similar...');
        ({ data: plans, error: planError } = await supabase
          .from('plans')
          .select('id, name')
          .ilike('name', `%${planName}%`));
      }
      
      if (planError || !plans || plans.length === 0) {
        console.error('Erro ao buscar plano:', planError);
        
        // Mostrar todos os planos disponíveis para debug
        const { data: allPlans } = await supabase.from('plans').select('id, name');
        console.log('Planos disponíveis na base de dados:', allPlans);
        
        throw new Error(`Plano "${planName}" não encontrado. Planos disponíveis: ${allPlans?.map(p => p.name).join(', ')}`);
      }
      
      const plan = plans[0]; // Usar o primeiro resultado
      console.log('Plano encontrado:', plan);

      // Inserir nova assinatura com ID válido
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: plan.id, // Usar ID real do plano
          plan_name: planName,
          start_date: now.toISOString(), // Adicionar start_date obrigatório
          end_date: endDate.toISOString(),
        })
        .select()
        .single();
      
      if (subscriptionError) {
        console.error('Erro ao criar assinatura:', subscriptionError);
        throw subscriptionError;
      }
      
      // Atualizar perfil com plano ativo
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          active_plan: planName,
          active_plan_until: endDate.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        throw profileError;
      }
      
      return { subscription, profile };
    },
    onSuccess: (data) => {
      // Invalidar cache para atualizar dados
      queryClient.invalidateQueries({ queryKey: ['profile', data.profile.id] });
      queryClient.invalidateQueries({ queryKey: ['activePlan', data.profile.id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', data.profile.id] });
    },
  });
};

// Função auxiliar para mapear nome do plano para ID
const getPlanId = (planName: string): number => {
  const planMapping: Record<string, number> = {
    'Básico': 1,
    'Gamer': 2,
    'Pro': 3,
  };
  
  return planMapping[planName] || 1;
};