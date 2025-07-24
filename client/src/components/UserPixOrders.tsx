import { useState } from 'react';
import { QrCode, Copy, Check, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface PixOrder {
  id: string;
  userId?: string;
  amount?: number;
  description?: string;
  status: 'pendiente' | 'pagado' | 'cancelado';
  pixCode?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserPixOrdersProps {
  userId?: string;
}

const UserPixOrders = ({ userId }: UserPixOrdersProps) => {
  const [copiedCode, setCopiedCode] = useState('');
  const { toast } = useToast();

  // Obtener pedidos del usuario
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['/api/pix/orders'],
    refetchInterval: 10000, // Actualizar cada 10 segundos
  });

  const allOrders = (ordersData as { orders: PixOrder[] })?.orders || [];
  const userOrders = userId ? allOrders.filter(order => order.userId === userId) : allOrders;

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
    return new Date(dateString).toLocaleString('es-ES');
  };

  const formatCurrency = (amount?: number) => {
    return amount ? `R$ ${amount.toFixed(2)}` : 'N/A';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Mis Pedidos Pix ({userOrders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {userOrders.length === 0 ? (
          <div className="text-center py-8">
            <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tienes pedidos Pix registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map((order: PixOrder) => (
              <Card key={order.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">Pedido #{order.id}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <Label className="text-muted-foreground">Monto</Label>
                      <p className="flex items-center gap-1 font-medium">
                        <DollarSign className="w-3 h-3" />
                        {formatCurrency(order.amount)}
                      </p>
                    </div>
                    {order.description && (
                      <div>
                        <Label className="text-muted-foreground">Descripción</Label>
                        <p>{order.description}</p>
                      </div>
                    )}
                  </div>

                  {order.status === 'pendiente' && !order.pixCode && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-yellow-800 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Esperando código Pix</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Tu pedido está siendo procesado. Recibirás el código Pix para realizar el pago en breve.
                      </p>
                    </div>
                  )}

                  {order.pixCode && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-800 mb-3">
                        <QrCode className="w-4 h-4" />
                        <span className="font-medium">Código Pix para Pago</span>
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-sm text-blue-700">
                          Usa este código en la app de Belo o cualquier app de banco para realizar el pago:
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <code className="bg-white border border-blue-300 p-3 rounded text-xs flex-1 font-mono break-all">
                            {order.pixCode}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(order.pixCode!)}
                            className="shrink-0"
                          >
                            {copiedCode === order.pixCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        
                        {order.status === 'pendiente' && (
                          <p className="text-xs text-blue-600">
                            💡 Copia el código y pégalo en la app de Belo para completar tu pago.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {order.status === 'pagado' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-800">
                        <Check className="w-4 h-4" />
                        <span className="font-medium">Pago confirmado</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Tu pago ha sido procesado exitosamente.
                      </p>
                    </div>
                  )}

                  {order.status === 'cancelado' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-medium">Pedido cancelado</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        Este pedido ha sido cancelado.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPixOrders;