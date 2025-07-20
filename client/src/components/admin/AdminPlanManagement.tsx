import { useState } from 'react';
import { Package, Edit, Save, X, Plus, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePlanStock, useUpdatePlanStock } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';

const AdminPlanManagement = () => {
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [newStock, setNewStock] = useState({
    availableSlots: 0,
    totalSlots: 0,
    isAvailable: true,
  });

  const { data: planStock, isLoading } = usePlanStock();
  const updatePlanStock = useUpdatePlanStock();
  const { toast } = useToast();

  // Get unique plans from planStock data
  const plans = planStock?.map(stock => stock.plans).filter(Boolean) || [];
  const uniquePlans = plans.filter((plan, index, self) => 
    plan && self.findIndex(p => p && p.id === plan.id) === index
  );

  const handleUpdateStock = async () => {
    if (!editingPlan) return;

    try {
      await updatePlanStock.mutateAsync({
        planId: editingPlan.id,
        availableSlots: newStock.totalSlots, // Usando totalSlots como stock principal
        totalSlots: newStock.totalSlots,
        isAvailable: newStock.isAvailable,
      });

      toast({
        title: "Estoque atualizado",
        description: `Estoque do plano ${editingPlan.name} foi atualizado para ${newStock.totalSlots} unidades.`,
      });

      setEditingPlan(null);
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o estoque.",
        variant: "destructive",
      });
    }
  };

  const getCurrentStock = (planId: string) => {
    const stockData = planStock?.find(stock => stock.plan_id === planId);
    return stockData || {
      available_slots: 0,
      total_slots: 0,
      is_available: true,
    };
  };

  const getStockStatus = (available: number, total: number) => {
    const percentage = total > 0 ? (available / total) * 100 : 0;
    
    if (percentage === 0) {
      return { text: 'Esgotado', color: 'bg-red-500' };
    } else if (percentage <= 20) {
      return { text: 'Estoque baixo', color: 'bg-yellow-500' };
    } else {
      return { text: 'Disponível', color: 'bg-green-500' };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cloud-blue"></div>
            <span className="ml-2">Carregando planos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Gerenciamento de Planos e Estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Gerencie o estoque de cada plano e configure a disponibilidade.
          </p>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid gap-6">
        {uniquePlans.map((plan) => {
          const currentStock = getCurrentStock(plan.id);
          const stockStatus = getStockStatus(currentStock.available_slots, currentStock.total_slots);
          
          return (
            <Card key={plan.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-cloud-blue/10 rounded-lg">
                      <Package className="w-6 h-6 text-cloud-blue" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                      <p className="text-muted-foreground">{plan.description}</p>
                      <p className="text-lg font-bold text-cloud-blue mt-1">{plan.price}/mês</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Stock Info */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${stockStatus.color} text-white`}>
                          {stockStatus.text}
                        </Badge>
                        {!currentStock.is_available && (
                          <Badge variant="destructive">
                            Indisponível
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>Disponível: {currentStock.available_slots}</p>
                        <p>Total: {currentStock.total_slots}</p>
                      </div>

                      {currentStock.available_slots === 0 && currentStock.total_slots > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-xs">Sem estoque</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setEditingPlan({ id: plan.id, name: plan.name });
                            setNewStock({
                              availableSlots: currentStock.available_slots,
                              totalSlots: currentStock.total_slots,
                              isAvailable: currentStock.is_available,
                            });
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar Estoque
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Estoque - {plan.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="available">Slots Disponíveis</Label>
                              <Input
                                id="available"
                                type="number"
                                value={newStock.availableSlots}
                                onChange={(e) => setNewStock({
                                  ...newStock,
                                  availableSlots: Number(e.target.value)
                                })}
                                min="0"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="total">Total de Slots</Label>
                              <Input
                                id="total"
                                type="number"
                                value={newStock.totalSlots}
                                onChange={(e) => setNewStock({
                                  ...newStock,
                                  totalSlots: Number(e.target.value)
                                })}
                                min="0"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="available-switch">Plano Disponível</Label>
                            <Switch
                              id="available-switch"
                              checked={newStock.isAvailable}
                              onCheckedChange={(checked) => setNewStock({
                                ...newStock,
                                isAvailable: checked
                              })}
                            />
                          </div>

                          {newStock.availableSlots > newStock.totalSlots && (
                            <div className="flex items-center gap-2 text-amber-600 text-sm">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Slots disponíveis não podem ser maiores que o total</span>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button 
                              onClick={handleUpdateStock}
                              disabled={updatePlanStock.isPending || newStock.availableSlots > newStock.totalSlots}
                              className="flex-1"
                            >
                              {updatePlanStock.isPending ? 'Salvando...' : 'Salvar'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Stock Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Ocupação do Estoque</span>
                    <span>
                      {currentStock.total_slots > 0 
                        ? `${Math.round(((currentStock.total_slots - currentStock.available_slots) / currentStock.total_slots) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-cloud-blue h-2 rounded-full transition-all"
                      style={{ 
                        width: currentStock.total_slots > 0 
                          ? `${((currentStock.total_slots - currentStock.available_slots) / currentStock.total_slots) * 100}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Global Stock Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Globais de Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-2">Mensagem de Estoque Esgotado</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Essa mensagem será exibida quando um plano estiver sem estoque.
              </p>
              <Input 
                placeholder="Este plano está temporariamente indisponível. Tente novamente mais tarde."
                defaultValue="Este plano está temporariamente indisponível. Tente novamente mais tarde."
              />
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-2">Alerta de Estoque Baixo</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Receber notificação quando o estoque estiver abaixo de:
              </p>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="5" className="w-20" />
                <span className="text-sm">slots disponíveis</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPlanManagement;