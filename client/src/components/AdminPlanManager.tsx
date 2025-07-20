import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Monitor, Cpu, HardDrive, Zap, Eye, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Plan {
  id: string;
  name: string;
  stock: number;
  price: string;
  description: string;
  ram: string;
  cpu: string;
  storage: string;
  gpu: string;
  max_resolution: string;
  status: string;
  created_at: string;
}

interface PlanFormData {
  name: string;
  stock: number;
  price: string;
  description: string;
  ram: string;
  cpu: string;
  storage: string;
  gpu: string;
  max_resolution: string;
  status: string;
}

const AdminPlanManager = () => {
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    stock: 0,
    price: 'R$ ',
    description: '',
    ram: '4 GB',
    cpu: '2 vCPUs',
    storage: '50 GB',
    gpu: 'Compartilhada',
    max_resolution: '1080p',
    status: 'Online'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todos os planos
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Plan[];
    }
  });

  // Mutation para criar plano
  const createPlanMutation = useMutation({
    mutationFn: async (planData: PlanFormData) => {
      const { data, error } = await supabase
        .from('plans')
        .insert(planData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast({ title: 'Plano criado com sucesso!' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar plano',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para atualizar plano
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, planData }: { id: string; planData: PlanFormData }) => {
      const { data, error } = await supabase
        .from('plans')
        .update(planData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast({ title: 'Plano atualizado com sucesso!' });
      resetForm();
      setIsDialogOpen(false);
      setEditingPlan(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar plano',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para deletar plano
  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast({ title: 'Plano deletado com sucesso!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao deletar plano',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      stock: 0,
      price: 'R$ ',
      description: '',
      ram: '4 GB',
      cpu: '2 vCPUs',
      storage: '50 GB',
      gpu: 'Compartilhada',
      max_resolution: '1080p',
      status: 'Online'
    });
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      stock: plan.stock || 0,
      price: plan.price,
      description: plan.description || '',
      ram: plan.ram,
      cpu: plan.cpu,
      storage: plan.storage,
      gpu: plan.gpu,
      max_resolution: plan.max_resolution,
      status: plan.status
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'Nome do plano é obrigatório',
        variant: 'destructive'
      });
      return;
    }

    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, planData: formData });
    } else {
      createPlanMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este plano? Esta ação não pode ser desfeita.')) {
      deletePlanMutation.mutate(id);
    }
  };

  const handleNewPlan = () => {
    setEditingPlan(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cloud-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Planos</h2>
        <Button onClick={handleNewPlan} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Criar Novo Plano
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    <Badge variant={plan.status === 'Online' ? 'default' : 'destructive'}>
                      {plan.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-2xl font-bold text-cloud-blue">{plan.price}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">{plan.description}</p>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Monitor className="w-3 h-3" />
                  <span>RAM: {plan.ram}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  <span>CPU: {plan.cpu}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  <span>Storage: {plan.storage}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>GPU: {plan.gpu}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>Resolução: {plan.max_resolution}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Stock: {plan.stock || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para criar/editar plano */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Plano *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Plan Pro"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Preço *</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Ex: R$ 99"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do plano..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Offline">Offline</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Especificações Técnicas</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ram">RAM *</Label>
                  <Input
                    id="ram"
                    value={formData.ram}
                    onChange={(e) => setFormData(prev => ({ ...prev, ram: e.target.value }))}
                    placeholder="Ex: 8 GB"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cpu">CPU *</Label>
                  <Input
                    id="cpu"
                    value={formData.cpu}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpu: e.target.value }))}
                    placeholder="Ex: 4 vCPUs"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="storage">Armazenamento *</Label>
                  <Input
                    id="storage"
                    value={formData.storage}
                    onChange={(e) => setFormData(prev => ({ ...prev, storage: e.target.value }))}
                    placeholder="Ex: 100 GB"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gpu">GPU *</Label>
                  <Input
                    id="gpu"
                    value={formData.gpu}
                    onChange={(e) => setFormData(prev => ({ ...prev, gpu: e.target.value }))}
                    placeholder="Ex: GTX 1060"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_resolution">Resolução Máxima *</Label>
                  <Select
                    value={formData.max_resolution}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, max_resolution: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="1440p">1440p</SelectItem>
                      <SelectItem value="4K">4K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingPlan ? 'Atualizar' : 'Criar'} Plano
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPlanManager;