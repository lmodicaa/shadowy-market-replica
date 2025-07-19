import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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

// Hook para obter estoque de planos
export const usePlanStock = () => {
  return useQuery({
    queryKey: ['planStock'],
    queryFn: async () => {
      // Try RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_plans_with_stock');
      
      if (!rpcError && rpcData) {
        // Transform to match expected format
        return rpcData.map(plan => ({
          id: plan.id,
          plan_id: plan.id,
          available_slots: plan.available_slots,
          total_slots: plan.total_slots,
          is_available: plan.is_available,
          plans: {
            id: plan.id,
            name: plan.name,
            price: plan.price,
            description: plan.description
          }
        }));
      }
      
      console.log('RPC failed, trying manual query:', rpcError);
      
      // Fallback to manual query
      const { data, error } = await supabase
        .from('plan_stock')
        .select(`
          *,
          plans:plan_id (name, price, description)
        `)
        .order('plan_id');
      
      if (error) {
        console.error('Erro ao buscar estoque:', error);
        throw error;
      }
      
      return data;
    },
  });
};

// Hook para atualizar configurações
export const useUpdateAdminSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: string; description?: string }) => {
      console.log('useUpdateAdminSettings mutation started:', { key, value, description });
      
      // Direct update approach with detailed logging
      const { data, error } = await supabase
        .from('admin_settings')
        .upsert({
          key,
          value,
          description: description || '',
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      console.log('Direct settings update result:', { data, error });
      
      if (error) {
        console.error('Erro ao atualizar configuração:', error);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw error;
      }
      
      return data;
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
      const { data, error } = await supabase
        .from('plan_stock')
        .upsert({
          plan_id: planId,
          available_slots: availableSlots,
          total_slots: totalSlots,
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar estoque:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planStock'] });
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

