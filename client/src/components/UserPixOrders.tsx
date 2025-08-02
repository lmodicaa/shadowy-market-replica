import { useState } from 'react';
import { QrCode, Copy, Check, Clock, DollarSign, AlertCircle, Image, Type, Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';

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

interface UserPixOrdersProps {
  userId?: string;
}

const UserPixOrders = ({ userId }: UserPixOrdersProps) => {
  const [copiedCode, setCopiedCode] = useState('');
  const [selectedOrderForProof, setSelectedOrderForProof] = useState<PixOrder | null>(null);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    refetchInterval: 10000, // Actualizar cada 10 segundos
    enabled: !!userId, // Solo ejecutar si hay userId
  });

  // Mutación para enviar comprobante de pago
  const uploadPaymentProofMutation = useMutation({
    mutationFn: async ({ orderId, proofFile }: { orderId: string; proofFile: File }) => {
      console.log('🚀 Iniciando upload de comprovante para pedido:', orderId);
      console.log('📁 Arquivo:', proofFile.name, 'Tamanho:', proofFile.size, 'bytes');
      
      try {
        // Convertir archivo a Base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            console.log('✅ Arquivo convertido para Base64');
            resolve(reader.result as string);
          };
          reader.onerror = (error) => {
            console.error('❌ Erro ao converter arquivo para Base64:', error);
            reject(error);
          };
          reader.readAsDataURL(proofFile);
        });

        console.log('📤 Enviando dados para Supabase...');
        const { data, error } = await supabase
          .from('pix_orders')
          .update({
            payment_proof_file: base64,
            payment_proof_filename: proofFile.name,
            payment_proof_type: proofFile.type,
            payment_confirmed_at: new Date().toISOString(),
            payment_status: 'waiting_review'
          })
          .eq('id', orderId)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro do Supabase:', error);
          throw error;
        }
        
        console.log('✅ Comprovante enviado com sucesso:', data);
        return data;
      } catch (error) {
        console.error('❌ Erro no processo de upload:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('🎉 Upload concluído com sucesso:', data);
      queryClient.invalidateQueries({ queryKey: ['pix_orders'] });
      toast({ 
        title: "Comprovante enviado com sucesso!", 
        description: "Aguarde a revisão do administrador." 
      });
      setSelectedOrderForProof(null);
      setPaymentProofFile(null);
      setPaymentProofPreview('');
    },
    onError: (error: any) => {
      console.error('💥 Erro na mutação de upload:', error);
      
      let errorMessage = "Erro ao enviar comprovante";
      
      // Mensagens de erro mais específicas
      if (error?.message?.includes('JWT')) {
        errorMessage = "Sessão expirada. Faça login novamente.";
      } else if (error?.message?.includes('RLS')) {
        errorMessage = "Permissão negada. Verifique se você tem acesso a este pedido.";
      } else if (error?.message?.includes('network')) {
        errorMessage = "Erro de conexão. Verifique sua internet.";
      } else if (error?.code === 'PGRST116') {
        errorMessage = "Pedido não encontrado ou você não tem permissão para atualizá-lo.";
      }
      
      toast({ 
        title: errorMessage, 
        description: "Tente novamente ou entre em contato com o suporte.",
        variant: "destructive" 
      });
    },
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.includes('image/') && !file.type.includes('pdf')) {
      toast({ title: "Apenas imagens e PDFs são aceitos", variant: "destructive" });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande. Máximo 5MB.", variant: "destructive" });
      return;
    }

    setPaymentProofFile(file);

    // Crear preview para imágenes
    if (file.type.includes('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPaymentProofPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPaymentProofPreview('');
    }
  };

  const handleUploadPaymentProof = () => {
    if (!selectedOrderForProof || !paymentProofFile) return;
    uploadPaymentProofMutation.mutate({
      orderId: selectedOrderForProof.id,
      proofFile: paymentProofFile
    });
  };

  const getStatusBadge = (order: PixOrder) => {
    const paymentStatus = order.payment_status || order.status;
    
    switch (paymentStatus) {
      case 'waiting_payment':
      case 'pendiente':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Aguardando Pagamento</Badge>;
      case 'waiting_review':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Upload className="w-3 h-3 mr-1" />Aguardando Revisão</Badge>;
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
                      {getStatusBadge(order)}
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
                      
                      {/* Payment Confirmation Button */}
                      {(order.payment_status === 'waiting_payment' || order.status === 'pendiente') && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-center space-y-3">
                            <p className="text-sm text-green-800 font-medium">
                              ✅ Fez o pagamento? Envie o comprobante para confirmação
                            </p>
                            <Button
                              onClick={() => setSelectedOrderForProof(order)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Enviar Comprobante
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Payment Status Messages */}
                      {order.payment_status === 'waiting_review' && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 text-blue-800 mb-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">Comprobante enviado - Aguardando revisão</span>
                          </div>
                          <p className="text-sm text-blue-700">
                            Seu comprobante foi enviado e está sendo analisado pelo administrador. Você receberá uma confirmação em breve.
                          </p>
                          {order.payment_confirmed_at && (
                            <p className="text-xs text-blue-600 mt-2">
                              Enviado em: {formatDate(order.payment_confirmed_at)}
                            </p>
                          )}
                        </div>
                      )}

                      {order.payment_status === 'approved' && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium">Pagamento aprovado!</span>
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            Seu pagamento foi confirmado pelo administrador.
                          </p>
                          {order.admin_reviewed_at && (
                            <p className="text-xs text-green-600 mt-2">
                              Aprovado em: {formatDate(order.admin_reviewed_at)}
                            </p>
                          )}
                        </div>
                      )}

                      {order.payment_status === 'rejected' && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 text-red-800 mb-2">
                            <XCircle className="w-4 h-4" />
                            <span className="font-medium">Pagamento rejeitado</span>
                          </div>
                          <p className="text-sm text-red-700">
                            O comprobante foi rejeitado. Entre em contato com o suporte.
                          </p>
                          {order.admin_review_notes && (
                            <div className="mt-2 p-2 bg-red-100 rounded">
                              <p className="text-xs text-red-800">
                                <strong>Motivo:</strong> {order.admin_review_notes}
                              </p>
                            </div>
                          )}
                          {order.admin_reviewed_at && (
                            <p className="text-xs text-red-600 mt-2">
                              Rejeitado em: {formatDate(order.admin_reviewed_at)}
                            </p>
                          )}
                        </div>
                      )}
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

      {/* Modal para upload de comprobante de pago */}
      {selectedOrderForProof && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedOrderForProof(null);
              setPaymentProofFile(null);
              setPaymentProofPreview('');
            }
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Enviar Comprobante de Pagamento
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Pedido #{selectedOrderForProof.id}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="payment-proof">
                  Selecionar arquivo (PDF ou imagem)
                </Label>
                <Input
                  id="payment-proof"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo 5MB. Formatos aceitos: PDF, JPG, PNG, WebP
                </p>
              </div>

              {paymentProofFile && (
                <div className="p-3 bg-gray-50 rounded border">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">{paymentProofFile.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tamanho: {(paymentProofFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  
                  {paymentProofPreview && (
                    <div className="mt-3">
                      <img 
                        src={paymentProofPreview} 
                        alt="Preview do comprobante" 
                        className="max-w-full h-32 object-contain rounded border"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  <strong>Importante:</strong> Certifique-se de que o comprobante mostra claramente:
                </p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1 ml-4">
                  <li>• Valor pago: {formatCurrency(selectedOrderForProof.amount)}</li>
                  <li>• Data e hora do pagamento</li>
                  <li>• Tipo de transação: PIX</li>
                  <li>• Status: "Concluído" ou "Aprovado"</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedOrderForProof(null);
                    setPaymentProofFile(null);
                    setPaymentProofPreview('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUploadPaymentProof}
                  disabled={!paymentProofFile || uploadPaymentProofMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {uploadPaymentProofMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar Pagamento
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UserPixOrders;