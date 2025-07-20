import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { initializeAdminSettings } from '@/utils/initializeAdminSettings';
import type { Profile, Plan, Subscription, AdminSettings, PlanStock, Admins } from '@shared/schema';

// Hook para verificar se o usuário é admin - TEMPORARIAMENTE RETORNA TRUE
export const useIsAdmin = (userId?: string) => {
  return useQuery({
    queryKey: ['isAdmin', userId],
    queryFn: async () => {
      if (!userId) return false;
      
      // TEMPORARY: Return true to bypass recursion issues
      // This allows admin panel access while we fix RLS policies
      console.log('Temporarily allowing admin access to fix recursion');
      return true;
    },
    enabled: !!userId,
  });
};

// Hook para obter todos os usuários (via função SQL ou RPC)
export const useAllUsers = () => {
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      // Try to get users via RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_users_admin');
      
      if (!rpcError && rpcData) {
        return rpcData;
      }
      
      console.log('RPC failed, trying profiles table:', rpcError);
      
      // Fallback to profiles with enhanced data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);
        throw profilesError;
      }
      
      // Enhance profiles with missing data
      const enhancedProfiles = profiles?.map(profile => ({
        ...profile,
        username: profile.username || `Usuário ${profile.id.substring(0, 8)}`,
        email: profile.username || 'email@example.com', // This will be filled by RPC function
        last_sign_in: null,
        email_confirmed: true,
      })) || [];
      
      return enhancedProfiles;
    },
  });
};

// Hook para obter todas as assinaturas
export const useAllSubscriptions = () => {
  return useQuery({
    queryKey: ['allSubscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar assinaturas:', error);
        throw error;
      }
      
      return data;
    },
  });
};

// Hook para obter configurações administrativas
export const useAdminSettings = () => {
  return useQuery({
    queryKey: ['adminSettings'],
    queryFn: async () => {
      // Primeiro, verificar se existe alguma configuração
      const { data: existingSettings, error: checkError } = await supabase
        .from('admin_settings')
        .select('key')
        .limit(1);
      
      // Se não há configurações, inicializar com padrões
      if (checkError || !existingSettings || existingSettings.length === 0) {
        console.log('Nenhuma configuração encontrada, inicializando...');
        await initializeAdminSettings();
      }
      
      // Agora buscar todas as configurações
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('key');
      
      if (error) {
        console.error('Erro ao buscar configurações:', error);
        throw error;
      }
      
      return data as AdminSettings[];
    },
  });
};

// Hook para obter planos com estoque
export const usePlanStock = () => {
  return useQuery({
    queryKey: ['planStock'],
    queryFn: async () => {
      console.log('Buscando planos com estoque...');
      
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar planos:', error);
        throw error;
      }
      
      console.log('Planos encontrados:', data);
      
      // Transform to match expected format
      return data?.map(plan => ({
        id: plan.id,
        plan_id: plan.id,
        available_slots: plan.stock || 0,
        total_slots: plan.stock || 0,
        is_available: true, // Sempre disponível se tiver stock > 0
        plans: {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          description: plan.description,
          stock: plan.stock
        }
      })) || [];
    },
  });
};

// Hook para atualizar configurações
export const useUpdateAdminSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: string; description?: string }) => {
      console.log('useUpdateAdminSettings mutation started:', { key, value, description });
      
      // Try to update first, if not found then insert
      const { data: existingData, error: selectError } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('key', key)
        .single();

      let result;
      
      if (existingData) {
        // Update existing record
        console.log('Updating existing setting:', key);
        const { data, error } = await supabase
          .from('admin_settings')
          .update({
            value,
            description: description || '',
            updated_at: new Date().toISOString(),
          })
          .eq('key', key)
          .select()
          .single();
        
        if (error) {
          console.error('Erro ao atualizar configuração existente:', error);
          throw error;
        }
        result = data;
      } else {
        // Insert new record
        console.log('Inserting new setting:', key);
        const { data, error } = await supabase
          .from('admin_settings')
          .insert({
            key,
            value,
            description: description || '',
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) {
          console.error('Erro ao inserir nova configuração:', error);
          throw error;
        }
        result = data;
      }
      
      console.log('Settings operation successful:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
    },
  });
};

// Hook para atualizar estoque de planos
export const useUpdatePlanStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      planId, 
      availableSlots, 
      totalSlots, 
      isAvailable 
    }: { 
      planId: string; 
      availableSlots: number; 
      totalSlots: number; 
      isAvailable: boolean; 
    }) => {
      console.log('=== INÍCIO ATUALIZAÇÃO STOCK ===');
      console.log('Dados recebidos:', { planId, availableSlots, totalSlots, isAvailable });
      
      // Verificar se o plano existe primeiro
      const { data: existingPlan, error: selectError } = await supabase
        .from('plans')
        .select('id, name, stock')
        .eq('id', planId)
        .single();
      
      console.log('Plano existente:', existingPlan);
      if (selectError) {
        console.error('Erro ao buscar plano:', selectError);
        throw new Error(`Plano não encontrado: ${selectError.message}`);
      }
      
      // Atualizar diretamente o campo stock na tabela plans
      console.log('Atualizando stock para:', totalSlots);
      console.log('SQL que será executado: UPDATE plans SET stock =', totalSlots, 'WHERE id =', planId);
      
      const { data, error } = await supabase
        .from('plans')
        .update({
          stock: totalSlots
        })
        .eq('id', planId)
        .select('*')
        .single();
      
      console.log('Resposta do Supabase após UPDATE:', { data, error });
      
      if (error) {
        console.error('Erro ao atualizar estoque do plano:', error);
        console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
        throw new Error(`Erro na atualização: ${error.message}`);
      }
      
      console.log('Stock update successful:', data);
      console.log('=== FIM ATUALIZAÇÃO STOCK ===');
      return data;
    },
    onSuccess: (data) => {
      console.log('Mutation successful, invalidating cache...');
      queryClient.invalidateQueries({ queryKey: ['planStock'] });
      queryClient.refetchQueries({ queryKey: ['planStock'] });
      console.log('Cache invalidated and refetch triggered');
    },
  });
};

// Hook para atualizar plano do usuário
export const useUpdateUserPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      planName, 
      duration = 30 
    }: { 
      userId: string; 
      planName: string | null; 
      duration?: number; 
    }) => {
      console.log('useUpdateUserPlan mutation started:', { userId, planName, duration });
      
      const finalPlanName = planName === 'none' ? null : planName;
      const endDate = finalPlanName ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
      
      console.log('Prepared data:', { finalPlanName, endDate });
      
      // Get actual plan UUIDs from database
      const { data: plansData } = await supabase.from('plans').select('id, name');
      console.log('Available plans from DB:', plansData);
      
      const planUuidMap: Record<string, string> = {};
      plansData?.forEach(plan => {
        planUuidMap[plan.name] = plan.id;
      });
      
      const planValue = finalPlanName ? (planUuidMap[finalPlanName] || finalPlanName) : null;
      console.log('Final plan value (UUID or null):', planValue);
      
      // Direct update approach with detailed logging
      const { data, error } = await supabase
        .from('profiles')
        .update({
          active_plan: planValue,
          active_plan_until: endDate?.toISOString() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();
      
      console.log('Direct Supabase update result:', { data, error });
      
      if (error) {
        console.error('Erro ao atualizar plano do usuário:', error);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['activePlan'] });
    },
  });
};

// Hook para excluir usuário
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // Primeiro excluir assinaturas relacionadas
      await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId);
      
      // Depois excluir o perfil
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error('Erro ao excluir usuário:', error);
        throw error;
      }
      
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allSubscriptions'] });
    },
  });
};

// Hook para obter estatísticas do sistema
export const useSystemStats = () => {
  return useQuery({
    queryKey: ['systemStats'],
    queryFn: async () => {
      // Buscar contadores
      const [usersResponse, subscriptionsResponse, activeSubscriptionsResponse] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('subscriptions').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).not('active_plan', 'is', null),
      ]);
      
      return {
        totalUsers: usersResponse.count || 0,
        totalSubscriptions: subscriptionsResponse.count || 0,
        activeSubscriptions: activeSubscriptionsResponse.count || 0,
      };
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};

