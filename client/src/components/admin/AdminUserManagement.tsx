import { useState } from 'react';
import { Search, Edit, Trash2, Crown, Calendar, Mail, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAllUsers, useUpdateUserPlan, useDeleteUser } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const AdminUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newPlan, setNewPlan] = useState('');
  const [planDuration, setPlanDuration] = useState(30);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const { data: users, isLoading, refetch: refetchUsers } = useAllUsers();
  const updateUserPlan = useUpdateUserPlan();
  const deleteUser = useDeleteUser();
  const { toast } = useToast();

  // Debug: Log users data
  console.log('AdminUserManagement - Raw users data:', users);
  console.log('AdminUserManagement - Users count:', users?.length || 0);

  const filteredUsers = (users || []).filter((user: any) => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.includes(searchTerm)
  );

  console.log('AdminUserManagement - Filtered users:', filteredUsers);
  console.log('AdminUserManagement - Filtered count:', filteredUsers.length);

  const handleUpdateUserPlan = async () => {
    if (!editingUser) return;

    console.log('Updating user plan:', {
      userId: editingUser.id,
      currentPlan: editingUser.active_plan,
      newPlan: newPlan,
      finalPlan: newPlan === 'none' ? null : newPlan,
      duration: planDuration
    });

    try {
      console.log('Starting plan update process...');
      
      // Test direct Supabase connection first
      const testConnection = await supabase.from('profiles').select('id').limit(1);
      console.log('Connection test:', testConnection);
      setDebugInfo({ step: 'connection_test', result: testConnection });
      
      // Skip admin check to avoid recursion
      console.log('Skipping admin check to avoid recursion');
      setDebugInfo((prev: any) => ({ ...prev, admin_check: 'skipped_recursion' }));
      
      // Get actual plan UUIDs from database
      const { data: plansData } = await supabase.from('plans').select('id, name');
      console.log('Available plans from DB:', plansData);
      
      const planUuidMap: Record<string, string> = {};
      plansData?.forEach(plan => {
        planUuidMap[plan.name] = plan.id;
      });
      
      const testPlanValue = newPlan === 'none' ? null : (planUuidMap[newPlan] || null);
      console.log('Testing with plan UUID:', testPlanValue);
      console.log('Plan mapping available:', planUuidMap);
      
      const directTest = await supabase
        .from('profiles')
        .update({ 
          active_plan: testPlanValue,
          updated_at: new Date().toISOString() 
        })
        .eq('id', editingUser.id)
        .select();
      
      console.log('Direct update test:', directTest);
      setDebugInfo((prev: any) => ({ ...prev, direct_test: directTest }));
      
      if (directTest.error) {
        throw new Error(`Permission Error: ${directTest.error.message} (Code: ${directTest.error.code})`);
      }
      
      const result = await updateUserPlan.mutateAsync({
        userId: editingUser.id,
        planName: newPlan === 'none' ? null : newPlan,
        duration: planDuration,
      });

      console.log('Plan update successful:', result);

      toast({
        title: "Plano atualizado",
        description: `Plano do usuário ${editingUser.username || editingUser.id} foi atualizado.`,
      });

      setEditingUser(null);
      setNewPlan('');
      setDebugInfo(null);
    } catch (error) {
      console.error('Plan update error:', error);
      setDebugInfo((prev: any) => ({ ...prev, error: error }));
      
      toast({
        title: "Erro",
        description: `Erro ao atualizar plano: ${(error as any)?.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string, username?: string) => {
    console.log('handleDeleteUser called with:', { userId, username });
    
    if (!confirm(`Tem certeza que deseja excluir o usuário ${username || userId}? Esta ação não pode ser desfeita.`)) {
      console.log('Exclusão cancelada pelo usuário');
      return;
    }

    console.log('Iniciando processo de exclusão...');
    
    try {
      const result = await deleteUser.mutateAsync(userId);
      console.log('Exclusão concluída com sucesso:', result);
      
      // Force immediate refetch of users data
      console.log('Forçando refetch imediato dos usuários...');
      setTimeout(async () => {
        await refetchUsers();
        console.log('Refetch completed after timeout');
      }, 100);
      
      toast({
        title: "Usuário excluído",
        description: `Usuário ${username || userId} foi excluído com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro durante exclusão:', error);
      
      const errorMessage = error?.message || 'Erro desconhecido ao excluir usuário';
      
      toast({
        title: "Erro na exclusão",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPlanStatus = (activePlan?: string, activePlanUntil?: string) => {
    if (!activePlan || !activePlanUntil) {
      return { status: 'Sem plano', color: 'bg-gray-500' };
    }

    const now = new Date();
    const expirationDate = new Date(activePlanUntil);
    const isExpired = expirationDate < now;

    if (isExpired) {
      return { status: 'Expirado', color: 'bg-red-500' };
    }

    const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 3) {
      return { status: `${daysRemaining}d restantes`, color: 'bg-yellow-500' };
    }

    return { status: 'Ativo', color: 'bg-green-500' };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cloud-blue"></div>
            <span className="ml-2">Carregando usuários...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      {debugInfo && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-orange-800 mb-2">Debug Info:</h4>
            <pre className="text-xs text-orange-700 overflow-auto max-h-32">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
      
      {/* Header with Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Gerenciamento de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">
              {filteredUsers.length} usuários
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.map((user: any) => {
          const planStatus = getPlanStatus(user.active_plan, user.active_plan_until);
          
          return (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url || ''} alt={user.username || 'User'} />
                      <AvatarFallback>
                        {user.username?.charAt(0) || user.id.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold">{user.username || 'Sem nome'}</h3>
                      {user.email && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs text-muted-foreground">
                          Criado em {formatDate(user.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-cloud-blue" />
                        <span className="font-medium">
                          {user.active_plan || 'Sem plano'}
                        </span>
                      </div>
                      <Badge className={`${planStatus.color} text-white text-xs`}>
                        {planStatus.status}
                      </Badge>
                      {user.active_plan_until && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Expira: {formatDate(user.active_plan_until)}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setNewPlan(user.active_plan || 'none');
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Usuário</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Usuário</Label>
                              <p className="text-sm text-muted-foreground">
                                {user.username || user.id}
                              </p>
                            </div>
                            
                            <div>
                              <Label htmlFor="plan">Plano</Label>
                              <Select value={newPlan} onValueChange={setNewPlan}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar plano" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Sem plano</SelectItem>
                                  <SelectItem value="Mate Core">Mate Core</SelectItem>
                                  <SelectItem value="Mate Nova">Mate Nova</SelectItem>
                                  <SelectItem value="Mate Pulse">Mate Pulse</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="duration">Duração (dias)</Label>
                              <Input
                                type="number"
                                value={planDuration}
                                onChange={(e) => setPlanDuration(Number(e.target.value))}
                                min="1"
                                max="365"
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                onClick={handleUpdateUserPlan}
                                disabled={updateUserPlan.isPending}
                                className="flex-1"
                              >
                                {updateUserPlan.isPending ? 'Salvando...' : 'Salvar'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        disabled={deleteUser.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum usuário encontrado para a busca.' : 'Nenhum usuário encontrado.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminUserManagement;