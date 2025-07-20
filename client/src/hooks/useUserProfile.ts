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
      planId,
      planName, 
      duration = 30 
    }: { 
      userId: string; 
      planId: string;
      planName: string; 
      duration?: number; // dias
    }) => {
      const now = new Date();
      const endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
      
      // Verificar se o usuário já tem um plano ativo
      console.log('Verificando plano ativo do usuário:', userId);
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('active_plan, active_plan_until')
        .eq('id', userId)
        .single();
      
      if (profileCheckError) {
        console.error('Erro ao verificar perfil:', profileCheckError);
        // Se não conseguir verificar, prosseguir (usuário pode não ter perfil ainda)
      } else if (existingProfile?.active_plan && existingProfile?.active_plan_until) {
        const planEndDate = new Date(existingProfile.active_plan_until);
        if (planEndDate > now) {
          throw new Error('Você já possui um plano ativo. Aguarde até o vencimento para adquirir um novo plano.');
        }
      }
      
      // Verificar subscripcões ativas com mais detalhes
      const { data: activeSubscriptions, error: subCheckError } = await supabase
        .from('subscriptions')
        .select('id, end_date, plan_name, created_at')
        .eq('user_id', userId)
        .gt('end_date', now.toISOString())
        .order('created_at', { ascending: false });
      
      if (subCheckError) {
        console.error('Erro ao verificar subscripcões:', subCheckError);
      } else if (activeSubscriptions && activeSubscriptions.length > 0) {
        console.log('Assinaturas ativas encontradas:', activeSubscriptions);
        const activeSub = activeSubscriptions[0];
        const endDate = new Date(activeSub.end_date);
        const timeRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Verificar se a assinatura realmente ainda é válida (margem de alguns minutos para possíveis diferenças de clock)
        if (endDate.getTime() - now.getTime() > 300000) { // 5 minutos de margem
          throw new Error(`Você já possui uma assinatura ativa do plano ${activeSub.plan_name}. Expira em ${timeRemaining} dias. Aguarde até o vencimento para adquirir um novo plano.`);
        } else {
          console.log('Assinatura encontrada mas próxima do vencimento, permitindo renovação:', activeSub);
        }
      }
      
      // Usar o ID do plano diretamente 
      console.log('Usando plano ID:', planId, 'nome:', planName);
      
      // Verificar se o plano existe na base de dados
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('id, name')
        .eq('id', planId)
        .single();
      
      if (planError || !plan) {
        console.error('Erro ao verificar plano:', planError);
        
        // Mostrar todos os planos disponíveis para debug
        const { data: allPlans } = await supabase.from('plans').select('id, name');
        console.log('Planos disponíveis na base de dados:', allPlans);
        
        throw new Error(`Plano com ID "${planId}" não encontrado. Planos disponíveis: ${allPlans?.map(p => `${p.name} (${p.id})`).join(', ')}`);
      }
      
      console.log('Plano verificado:', plan);

      // Inserir nova assinatura com ID válido
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId, // Usar planId fornecido diretamente
          plan_name: planName,
          start_date: now.toISOString(), // Data de início da assinatura
          end_date: endDate.toISOString(),
        })
        .select()
        .single();
      
      if (subscriptionError) {
        console.error('Erro ao criar assinatura:', subscriptionError);
        throw subscriptionError;
      }
      
      // Atualizar perfil com plano ativo usando UUID do plano
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          active_plan: planId, // Usar planId fornecido diretamente
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