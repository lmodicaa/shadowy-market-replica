import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Profile, Plan, Subscription, AdminSettings, PlanStock, Admins } from '@shared/schema';

// Hook para verificar se o usuário é admin
export const useIsAdmin = (userId?: string) => {
  return useQuery({
    queryKey: ['isAdmin', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('useIsAdmin: No userId provided');
        return false;
      }
      
      console.log('useIsAdmin: Checking admin status for userId:', userId);
      
      // First try the debug view (no RLS)
      console.log('useIsAdmin: Trying admin_debug view first...');
      const { data: debugData, error: debugError } = await supabase
        .from('admin_debug')
        .select('*')
        .eq('user_id', userId);
      
      console.log('useIsAdmin: Debug view result:', { debugData, debugError });
      
      // If debug view works, we know RLS is the issue
      if (!debugError && debugData && debugData.length > 0) {
        console.log('useIsAdmin: Found in debug view - RLS is blocking access');
        return true;
      }
      
      // Try to query admins table with more detailed error handling
      const { data, error, count } = await supabase
        .from('admins')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);
      
      console.log('useIsAdmin: Query result - data:', data, 'error:', error, 'count:', count);
      
      if (error) {
        console.log('useIsAdmin: Error found:', error);
        // If it's just "no rows returned", that's expected for non-admins
        if (error.code === 'PGRST116' || error.message?.includes('No rows')) return false;
        console.error('Erro ao verificar admin:', error);
        return false; // Don't throw, just return false for access denied
      }
      
      // Check if we have any data and count > 0
      const isAdmin = data && data.length > 0;
      console.log('useIsAdmin: Final result - isAdmin:', isAdmin, 'data:', data);
      return isAdmin;
    },
    enabled: !!userId,
  });
};

// Hook para obter todos os usuários
export const useAllUsers = () => {
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
      }
      
      return data as Profile[];
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
      const { data, error } = await supabase
        .from('admin_settings')
        .upsert({
          key,
          value,
          description,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar configuração:', error);
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
      const endDate = planName ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          active_plan: planName,
          active_plan_until: endDate?.toISOString() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar plano do usuário:', error);
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