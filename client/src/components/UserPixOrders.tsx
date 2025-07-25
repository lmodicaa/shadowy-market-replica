import { useState } from 'react';
import { QrCode, Copy, Check, Clock, DollarSign, AlertCircle, Image, Type } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
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
  pix_qr_image?: string;
  pix_type?: 'text' | 'qr';
  created_at: string;
  updated_at: string;
}

interface UserPixOrdersProps {
  userId?: string;
}

const UserPixOrders = ({ userId }: UserPixOrdersProps) => {
  const [copiedCode, setCopiedCode] = useState('');
  const { toast } = useToast();

  // Obtener pedidos del usuario desde Supabase
  const { data: userOrders = [], isLoading } = useQuery({
    queryKey: ['pix_orders', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('pix_orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching pix orders:', error);
        throw error;
      }
      
      return (data || []).map(order => ({
        id: order.id as string,
        user_id: order.user_id as string | undefined,
        plan_id: order.plan_id as string | undefined,
        plan_name: order.plan_name as string | undefined,
        amount: order.amount as string | undefined,
        description: order.description as string | undefined,
        status: order.status as 'pendiente' | 'pagado' | 'cancelado',
        pix_code: order.pix_code as string | undefined,
        pix_qr_image: order.pix_qr_image as string | undefined,
        pix_type: order.pix_type as 'text' | 'qr' | undefined,
        created_at: order.created_at as string,
        updated_at: order.updated_at as string
      }));
    },
    refetchInterval: 10000, // Actualizar cada 10 segundos
    enabled: !!userId, // Solo ejecutar si hay userId
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      toast({ title: "Código copiado para a área de transferência" });
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (error) {
      toast({ title: "Erro ao copiar para área de transferência", variant: "destructive" });
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
          <p>Carregando pedidos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Meus Pedidos Pix ({userOrders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {userOrders.length === 0 ? (
          <div className="text-center py-8">
            <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Você não tem pedidos Pix registrados</p>
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
                      {formatDate(order.created_at)}
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

                  {order.status === 'pendiente' && !order.pix_code && !order.pix_qr_image && (
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

                  {(order.pix_code || order.pix_qr_image) && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        {order.pix_type === 'qr' ? (
                          <QrCode className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Type className="w-5 h-5 text-blue-600" />
                        )}
                        <Label className="text-base font-semibold text-blue-800">
                          PIX para Pagamento - {order.pix_type === 'qr' ? 'Código QR' : 'Clave Texto'}
                        </Label>
                      </div>
                      
                      {order.pix_type === 'qr' && order.pix_qr_image ? (
                        <div className="space-y-3">
                          <div className="bg-white p-4 rounded-lg border-2 border-dashed border-blue-300 flex justify-center">
                            <img 
                              src={order.pix_qr_image} 
                              alt="Código QR PIX" 
                              className="max-w-64 max-h-64 object-contain"
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-blue-700 font-medium mb-1">
                              📱 Escaneie o código QR com seu app bancário
                            </p>
                            <p className="text-xs text-blue-600">
                              Use a câmera do seu banco ou app de pagamento PIX
                            </p>
                          </div>
                        </div>
                      ) : order.pix_code ? (
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg border-2 border-dashed border-blue-300">
                            <div className="flex items-center gap-2">
                              <code className="flex-1 font-mono text-sm bg-gray-50 p-3 rounded border break-all">
                                {order.pix_code}
                              </code>
                              <Button
                                size="sm"
                                onClick={() => copyToClipboard(order.pix_code!)}
                                className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                                title="Copiar clave PIX"
                              >
                                {copiedCode === order.pix_code ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-blue-700 font-medium mb-1">
                              📋 Copie a clave e cole no seu app bancário
                            </p>
                            <p className="text-xs text-blue-600">
                              Clique no botão "Copiar" e cole na opção "PIX Copia e Cola" do seu banco
                            </p>
                          </div>
                        </div>
                      ) : null}
                      
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
                        <p className="text-xs text-yellow-800">
                          💡 Após o pagamento, aguarde alguns minutos para confirmação automática
                        </p>
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