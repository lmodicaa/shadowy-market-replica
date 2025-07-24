import { useState, useEffect } from 'react';
import { QrCode, Copy, Check, Clock, DollarSign, User, AlertCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface PixOrder {
  id: string;
  user_id?: string;
  plan_id?: string;
  plan_name?: string;
  amount?: string;
  description?: string;
  status: 'pendiente' | 'pagado' | 'cancelado';
  pix_code?: string;
  created_at: string;
  updated_at: string;
}

const AdminPixOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState<PixOrder | null>(null);
  const [pixCode, setPixCode] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener todos los pedidos desde Supabase
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin_pix_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pix_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching pix orders:', error);
        throw error;
      }
      
      return data || [];
    },
    refetchInterval: 5000, // Actualizar cada 5 segundos
  });

  // Mutación para actualizar pedido
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('pix_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_pix_orders'] });
      queryClient.invalidateQueries({ queryKey: ['pix_orders'] });
      toast({ title: "Pedido atualizado com sucesso" });
      setSelectedOrder(null);
      setPixCode('');
    },
    onError: (error: any) => {
      console.error('Error updating order:', error);
      toast({ title: "Erro ao atualizar pedido", variant: "destructive" });
    },
  });

  // Mutación para eliminar pedido
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pix_orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_pix_orders'] });
      queryClient.invalidateQueries({ queryKey: ['pix_orders'] });
      toast({ title: "Pedido excluído com sucesso" });
    },
    onError: (error: any) => {
      console.error('Error deleting order:', error);
      toast({ title: "Erro ao excluir pedido", variant: "destructive" });
    },
  });

  const handleLoadPixCode = (order: PixOrder) => {
    setSelectedOrder(order);
    setPixCode(order.pix_code || '');
  };

  const handleSavePixCode = () => {
    if (!selectedOrder || !pixCode.trim()) return;

    updateOrderMutation.mutate({
      id: selectedOrder.id,
      updates: { pix_code: pixCode.trim(), status: 'pendiente' }
    });
  };

  const handleMarkAsPaid = (order: PixOrder) => {
    updateOrderMutation.mutate({
      id: order.id,
      updates: { status: 'pagado' }
    });
  };

  const handleMarkAsCanceled = (order: PixOrder) => {
    updateOrderMutation.mutate({
      id: order.id,
      updates: { status: 'cancelado' }
    });
  };

  const handleDeleteOrder = (order: PixOrder) => {
    if (confirm(`Tem certeza que deseja excluir o pedido ${order.id}?`)) {
      deleteOrderMutation.mutate(order.id);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      toast({ title: "Código copiado al portapapeles" });
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (error) {
      toast({ title: "Error copiando al portapapeles", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'pagado':
        return <Badge variant="default" className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Pagado</Badge>;
      case 'cancelado':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (amount?: string) => {
    if (!amount) return 'N/A';
    const numericAmount = parseFloat(amount);
    return isNaN(numericAmount) ? amount : `R$ ${numericAmount.toFixed(2).replace('.', ',')}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cloud-blue mx-auto mb-4"></div>
          <p>Cargando pedidos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Gestión de Pedidos Pix ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay pedidos Pix registrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: PixOrder) => (
                <Card key={order.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">Pedido #{order.id}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status === 'pendiente' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleLoadPixCode(order)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <QrCode className="w-4 h-4 mr-1" />
                              Cargar QR Pix
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsPaid(order)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Marcar Pagado
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsCanceled(order)}
                            >
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteOrder(order)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Usuario</Label>
                        <p className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {order.user_id || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Monto</Label>
                        <p className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {formatCurrency(order.amount)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Creado</Label>
                        <p>{formatDate(order.created_at)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Actualizado</Label>
                        <p>{formatDate(order.updated_at)}</p>
                      </div>
                    </div>

                    {order.description && (
                      <div className="mt-3">
                        <Label className="text-muted-foreground">Descripción</Label>
                        <p className="text-sm">{order.description}</p>
                      </div>
                    )}

                    {order.pix_code && (
                      <div className="mt-3">
                        <Label className="text-muted-foreground">Código Pix</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-muted p-2 rounded text-xs flex-1 font-mono">
                            {order.pix_code}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(order.pix_code!)}
                          >
                            {copiedCode === order.pix_code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para cargar código Pix */}
      {selectedOrder && (
        <Card className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 max-w-lg w-full mx-4">
            <CardHeader className="p-0 mb-4">
              <CardTitle>Cargar Código QR Pix - Pedido #{selectedOrder.id}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div>
                <Label htmlFor="pixCode">Código/Clave Pix de Belo</Label>
                <Textarea
                  id="pixCode"
                  value={pixCode}
                  onChange={(e) => setPixCode(e.target.value)}
                  placeholder="Pega aquí el código QR o clave Pix copiado desde la app de Belo..."
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSavePixCode}
                  disabled={!pixCode.trim() || updateOrderMutation.isPending}
                  className="flex-1"
                >
                  {updateOrderMutation.isPending ? 'Guardando...' : 'Guardar y Marcar Pagado'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedOrder(null);
                    setPixCode('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminPixOrders;