import { useState, useEffect } from 'react';
import { QrCode, Copy, Check, Clock, DollarSign, User, AlertCircle, Trash2, Image, Type, Upload, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  pix_qr_image?: string;
  pix_type?: 'text' | 'qr';
  payment_proof_file?: string;
  payment_proof_filename?: string;
  payment_proof_type?: string;
  payment_confirmed_at?: string;
  admin_reviewed_at?: string;
  admin_review_notes?: string;
  payment_status?: 'waiting_payment' | 'waiting_review' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

const AdminPixOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState<PixOrder | null>(null);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<PixOrder | null>(null);
  const [pixCode, setPixCode] = useState('');
  const [pixType, setPixType] = useState<'text' | 'qr'>('text');
  const [qrImage, setQrImage] = useState<File | null>(null);
  const [qrImagePreview, setQrImagePreview] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener todos los pedidos desde Supabase
  const { data: orders = [], isLoading } = useQuery<PixOrder[]>({
    queryKey: ['admin_pix_orders'],
    queryFn: async (): Promise<PixOrder[]> => {
      const { data, error } = await supabase
        .from('pix_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching pix orders:', error);
        throw error;
      }
      
      console.log('🔍 AdminPixOrders - Dados brutos do Supabase:', data);
      console.log('🔍 AdminPixOrders - Total de pedidos encontrados:', data?.length || 0);
      
      // Log para verificar se há comprovantes de pagamento
      const ordersWithProofs = data?.filter(order => order.payment_proof_file) || [];
      console.log('📄 AdminPixOrders - Pedidos com comprovantes:', ordersWithProofs.length);
      
      if (ordersWithProofs.length > 0) {
        console.log('📋 AdminPixOrders - Primeiro pedido com comprovante:', {
          id: ordersWithProofs[0].id,
          payment_status: ordersWithProofs[0].payment_status,
          has_proof_file: !!ordersWithProofs[0].payment_proof_file,
          proof_filename: ordersWithProofs[0].payment_proof_filename,
          proof_type: ordersWithProofs[0].payment_proof_type,
          confirmed_at: ordersWithProofs[0].payment_confirmed_at
        });
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
        payment_proof_file: order.payment_proof_file as string | undefined,
        payment_proof_filename: order.payment_proof_filename as string | undefined,
        payment_proof_type: order.payment_proof_type as string | undefined,
        payment_confirmed_at: order.payment_confirmed_at as string | undefined,
        admin_reviewed_at: order.admin_reviewed_at as string | undefined,
        admin_review_notes: order.admin_review_notes as string | undefined,
        payment_status: order.payment_status as 'waiting_payment' | 'waiting_review' | 'approved' | 'rejected' | undefined,
        created_at: order.created_at as string,
        updated_at: order.updated_at as string
      }));
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

  // Mutación para eliminar pedido diretamente do Supabase
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Tentando excluir pedido:', id);
      
      const { data, error, count } = await supabase
        .from('pix_orders')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Erro ao excluir pedido:', error);
        console.error('Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Erro ao excluir pedido: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        console.warn('Nenhum pedido foi excluído - pode não existir ou não ter permissão');
        throw new Error('Pedido não encontrado ou sem permissão para excluir');
      }
      
      console.log('✅ Pedido excluído com sucesso:', { id, deletedData: data });
      return { success: true, deleted: data };
    },
    onSuccess: (result) => {
      console.log('✅ Exclusão bem-sucedida:', result);
      queryClient.invalidateQueries({ queryKey: ['admin_pix_orders'] });
      queryClient.invalidateQueries({ queryKey: ['pix_orders'] });
      toast({ title: "Pedido excluído com sucesso" });
    },
    onError: (error: any) => {
      console.error('❌ Erro na exclusão:', error);
      toast({ 
        title: "Erro ao excluir pedido", 
        description: error.message || "Verifique as permissões de administrador",
        variant: "destructive" 
      });
    },
  });

  // Mutación para aprovar comprobante de pago
  const approvePaymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      console.log('🎯 Iniciando aprovação do pagamento para pedido:', orderId);
      
      // 1. Primeiro, buscar os dados completos do pedido
      const { data: orderData, error: orderError } = await supabase
        .from('pix_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        console.error('❌ Erro ao buscar dados do pedido:', orderError);
        throw new Error('Pedido não encontrado');
      }

      console.log('📋 Dados do pedido encontrado:', {
        id: orderData.id,
        user_id: orderData.user_id,
        plan_id: orderData.plan_id,
        plan_name: orderData.plan_name
      });

      if (!orderData.user_id || !orderData.plan_id) {
        throw new Error('Dados do pedido incompletos (user_id ou plan_id faltando)');
      }

      // 2. Buscar dados do plano
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', orderData.plan_id)
        .single();

      if (planError || !planData) {
        console.error('❌ Erro ao buscar dados do plano:', planError);
        throw new Error('Plano não encontrado');
      }

      console.log('📦 Dados do plano encontrado:', {
        id: planData.id,
        name: planData.name,
        duration: planData.duration
      });

      // 3. Calcular data de expiração do plano
      const startDate = new Date();
      const endDate = new Date();
      const duration = typeof planData.duration === 'number' ? planData.duration : 30;
      endDate.setDate(startDate.getDate() + duration);

      console.log('📅 Datas calculadas:', {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        duration: duration
      });

      // 4. Atualizar perfil do usuário com plano ativo
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          active_plan: planData.id,
          active_plan_until: endDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderData.user_id);

      if (profileError) {
        console.error('❌ Erro ao atualizar perfil do usuário:', profileError);
        throw new Error('Erro ao ativar plano no perfil do usuário');
      }

      console.log('✅ Perfil do usuário atualizado com plano ativo');

      // 5. Criar registro na tabela de assinaturas
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: orderData.user_id,
          plan_id: planData.id,
          plan_name: planData.name,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });

      if (subscriptionError) {
        console.error('❌ Erro ao criar registro de assinatura:', subscriptionError);
        throw new Error('Erro ao registrar assinatura');
      }

      console.log('✅ Registro de assinatura criado');

      // 6. Diminuir estoque do plano (se aplicável)
      const currentStock = typeof planData.stock === 'number' ? planData.stock : 0;
      if (currentStock > 0) {
        const { error: stockError } = await supabase
          .from('plans')
          .update({
            stock: currentStock - 1
          })
          .eq('id', String(planData.id));

        if (stockError) {
          console.error('⚠️ Erro ao diminuir estoque do plano:', stockError);
          // Não falha a operação se for apenas erro de estoque
        } else {
          console.log('📦 Estoque do plano diminuído');
        }
      }

      // 7. Remover o pedido PIX (já foi processado)
      const { error: deleteError } = await supabase
        .from('pix_orders')
        .delete()
        .eq('id', orderId);

      if (deleteError) {
        console.error('❌ Erro ao remover pedido:', deleteError);
        throw new Error('Erro ao remover pedido processado');
      }

      console.log('🗑️ Pedido removido com sucesso');

      return {
        success: true,
        orderId,
        userId: orderData.user_id,
        planName: planData.name,
        endDate: endDate.toISOString()
      };
    },
    onSuccess: (result) => {
      console.log('🎉 Aprovação completa:', result);
      queryClient.invalidateQueries({ queryKey: ['admin_pix_orders'] });
      queryClient.invalidateQueries({ queryKey: ['pix_orders'] });
      queryClient.invalidateQueries({ queryKey: ['user_profile'] });
      queryClient.invalidateQueries({ queryKey: ['user_subscriptions'] });
      toast({ 
        title: "Pagamento aprovado e plano ativado!", 
        description: `Plano ${result.planName} ativado até ${new Date(result.endDate).toLocaleDateString('pt-BR')}`
      });
      setSelectedOrderForReview(null);
      setReviewNotes('');
    },
    onError: (error: any) => {
      console.error('❌ Erro na aprovação:', error);
      toast({ 
        title: "Erro ao processar aprovação", 
        description: error.message || "Verifique os logs para mais detalhes",
        variant: "destructive" 
      });
    },
  });

  // Mutación para rejeitar comprobante de pago
  const rejectPaymentMutation = useMutation({
    mutationFn: async ({ orderId, notes }: { orderId: string; notes: string }) => {
      const { data, error } = await supabase
        .from('pix_orders')
        .update({
          payment_status: 'rejected',
          admin_reviewed_at: new Date().toISOString(),
          admin_review_notes: notes
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_pix_orders'] });
      queryClient.invalidateQueries({ queryKey: ['pix_orders'] });
      toast({ title: "Pagamento rejeitado" });
      setSelectedOrderForReview(null);
      setReviewNotes('');
    },
    onError: (error: any) => {
      console.error('Error rejecting payment:', error);
      toast({ title: "Erro ao rejeitar pagamento", variant: "destructive" });
    },
  });

  const handleLoadPixCode = (order: PixOrder) => {
    setSelectedOrder(order);
    setPixCode(order.pix_code || '');
    setPixType(order.pix_type || 'text');
    setQrImagePreview(order.pix_qr_image || '');
    setQrImage(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Don't prevent default here as it might interfere with file selection
    event.stopPropagation();
    
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setQrImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setQrImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({ 
        title: "Imagen cargada correctamente",
        description: `Archivo: ${file.name}`,
      });
    } else if (event.target.files?.length) {
      toast({ 
        title: "Error de archivo",
        description: "Por favor selecciona una imagen válida (PNG, JPG, JPEG, WebP)",
        variant: "destructive" 
      });
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSavePixCode = async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!selectedOrder) return;

    let updates: any = { status: 'pendiente', pix_type: pixType };

    if (pixType === 'text') {
      if (!pixCode.trim()) return;
      updates.pix_code = pixCode.trim();
      updates.pix_qr_image = null;
    } else if (pixType === 'qr') {
      if (!qrImage && !qrImagePreview) return;
      if (qrImage) {
        const base64Image = await convertToBase64(qrImage);
        updates.pix_qr_image = base64Image;
      } else {
        updates.pix_qr_image = qrImagePreview;
      }
      updates.pix_code = null;
    }

    updateOrderMutation.mutate({
      id: selectedOrder.id,
      updates
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

  const getStatusBadge = (order: PixOrder) => {
    const paymentStatus = order.payment_status || order.status;
    
    switch (paymentStatus) {
      case 'waiting_payment':
      case 'pendiente':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Aguardando Pagamento</Badge>;
      case 'waiting_review':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 animate-pulse"><Upload className="w-3 h-3 mr-1" />REVISAR COMPROBANTE</Badge>;
      case 'approved':
      case 'pagado':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
      case 'cancelado':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{paymentStatus}</Badge>;
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
                        {getStatusBadge(order)}
                      </div>
                      <div className="flex items-center gap-2">
                        {order.payment_status === 'waiting_review' && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedOrderForReview(order)}
                            className="bg-orange-600 hover:bg-orange-700 animate-pulse"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Revisar Comprobante
                          </Button>
                        )}
                        
                        {(order.status === 'pendiente' && (!order.payment_status || order.payment_status === 'waiting_payment')) && (
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

                    {(order.pix_code || order.pix_qr_image) && (
                      <div className="mt-3">
                        <Label className="text-muted-foreground">
                          PIX {order.pix_type === 'qr' ? 'QR Code' : 'Código Texto'}
                        </Label>
                        {order.pix_type === 'qr' && order.pix_qr_image ? (
                          <div className="mt-2 flex justify-center bg-muted/20 p-4 rounded border">
                            <img 
                              src={order.pix_qr_image} 
                              alt="PIX QR Code" 
                              className="max-w-48 max-h-48 object-contain border rounded"
                            />
                          </div>
                        ) : order.pix_code ? (
                          <div className="flex items-center gap-2 mt-1">
                            <code className="bg-muted p-2 rounded text-xs flex-1 font-mono break-all">
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
                        ) : null}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para cargar código Pix o imagen QR */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedOrder(null);
              setPixCode('');
              setQrImage(null);
              setQrImagePreview('');
              setPixType('text');
            }
          }}
        >
          <div 
            className="bg-background border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-0 mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Cargar PIX - Pedido #{selectedOrder.id}
              </h3>
            </div>
            <div className="p-0 space-y-4">
              <Tabs value={pixType} onValueChange={(value) => setPixType(value as 'text' | 'qr')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Clave PIX Texto
                  </TabsTrigger>
                  <TabsTrigger value="qr" className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Código QR Imagen
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4">
                  <div>
                    <Label htmlFor="pixCode" className="text-base font-medium">
                      Clave PIX Texto
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Copia y pega la clave PIX de texto desde la app de Belo
                    </p>
                    <Textarea
                      id="pixCode"
                      value={pixCode}
                      onChange={(e) => setPixCode(e.target.value)}
                      placeholder="Ejemplo: 00020126330014BR.GOV.BCB.PIX2511exemplo@email.com..."
                      rows={4}
                      className="font-mono text-sm"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="qr" className="space-y-4">
                  <div>
                    <Label htmlFor="qrImage" className="text-base font-medium">
                      Imagen del Código QR
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Sube una imagen del código QR desde la app de Belo
                    </p>
                    <div className="space-y-2">
                      <Input
                        id="qrImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <p className="text-xs text-muted-foreground">
                        Formatos soportados: PNG, JPG, JPEG, WebP
                      </p>
                    </div>
                  </div>
                  
                  {qrImagePreview && (
                    <div className="border rounded-lg p-4 bg-muted/20">
                      <Label className="text-sm font-medium">Vista previa:</Label>
                      <div className="mt-2 flex justify-center">
                        <img 
                          src={qrImagePreview} 
                          alt="QR Code Preview" 
                          className="max-w-64 max-h-64 object-contain border rounded"
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSavePixCode();
                  }}
                  disabled={
                    (pixType === 'text' && !pixCode.trim()) || 
                    (pixType === 'qr' && !qrImage && !qrImagePreview) || 
                    updateOrderMutation.isPending
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {updateOrderMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Guardar PIX
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedOrder(null);
                    setPixCode('');
                    setQrImage(null);
                    setQrImagePreview('');
                    setPixType('text');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para revisar comprobante de pago */}
      {selectedOrderForReview && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedOrderForReview(null);
              setReviewNotes('');
            }
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Revisar Comprobante de Pagamento
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Pedido #{selectedOrderForReview.id} - {formatCurrency(selectedOrderForReview.amount)}
              </p>
            </div>

            <div className="space-y-4">
              {/* Informações do pedido */}
              <div className="bg-gray-50 p-4 rounded border">
                <h4 className="font-medium mb-2">Informações do Pedido</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Usuário</Label>
                    <p>{selectedOrderForReview.user_id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Valor</Label>
                    <p>{formatCurrency(selectedOrderForReview.amount)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Criado em</Label>
                    <p>{formatDate(selectedOrderForReview.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Comprobante enviado em</Label>
                    <p>{selectedOrderForReview.payment_confirmed_at 
                      ? formatDate(selectedOrderForReview.payment_confirmed_at)
                      : 'N/A'
                    }</p>
                  </div>
                </div>
              </div>

              {/* Comprobante de pago */}
              {selectedOrderForReview.payment_proof_file && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                  <h4 className="font-medium mb-3">Comprobante Enviado pelo Cliente</h4>
                  
                  {selectedOrderForReview.payment_proof_type?.includes('image/') ? (
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded border">
                        <img 
                          src={selectedOrderForReview.payment_proof_file} 
                          alt="Comprobante de pagamento" 
                          className="max-w-full h-auto max-h-96 object-contain mx-auto rounded"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Arquivo:</strong> {selectedOrderForReview.payment_proof_filename}</p>
                        <p><strong>Tipo:</strong> {selectedOrderForReview.payment_proof_type}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded border text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium">{selectedOrderForReview.payment_proof_filename}</p>
                      <p className="text-xs text-muted-foreground">PDF - {selectedOrderForReview.payment_proof_type}</p>
                      <a 
                        href={selectedOrderForReview.payment_proof_file}
                        download={selectedOrderForReview.payment_proof_filename}
                        className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Baixar PDF
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Notas da revisão */}
              <div>
                <Label htmlFor="review-notes">
                  Notas da Revisão (opcional)
                </Label>
                <Input
                  id="review-notes"
                  type="text"
                  placeholder="Adicione comentários sobre a revisão..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Será visível para o cliente em caso de rejeição
                </p>
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedOrderForReview(null);
                    setReviewNotes('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (!reviewNotes.trim()) {
                      toast({ 
                        title: "Por favor, adicione uma justificativa para a rejeição",
                        variant: "destructive" 
                      });
                      return;
                    }
                    rejectPaymentMutation.mutate({
                      orderId: selectedOrderForReview.id,
                      notes: reviewNotes
                    });
                  }}
                  disabled={rejectPaymentMutation.isPending}
                  className="flex-1"
                >
                  {rejectPaymentMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rejeitando...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => approvePaymentMutation.mutate(selectedOrderForReview.id)}
                  disabled={approvePaymentMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {approvePaymentMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Aprovando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar Pagamento
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPixOrders;