import { useState } from 'react';
import { Power, Monitor, Settings, Activity, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useActivePlan } from '@/hooks/useActivePlan';
import { useToast } from '@/hooks/use-toast';

interface VMDashboardProps {
  userId?: string;
}

// Simulação de dados da VM baseado no plano do usuário
const getVMSpecs = (planName?: string) => {
  if (!planName) return null;
  
  const lowerName = planName.toLowerCase();
  
  // Detectar tipo de plano baseado no nome
  if (lowerName.includes('básico') || lowerName.includes('basic')) {
    return {
      ram: '4 GB',
      cpu: '2 vCPUs',
      storage: '50 GB',
      gpu: 'Compartilhada',
      maxResolution: '1080p',
    };
  } else if (lowerName.includes('gamer') || lowerName.includes('intermedi')) {
    return {
      ram: '8 GB',
      cpu: '4 vCPUs',
      storage: '100 GB',
      gpu: 'GTX 1060',
      maxResolution: '1440p',
    };
  } else if (lowerName.includes('pro') || lowerName.includes('premium') || lowerName.includes('avançado')) {
    return {
      ram: '16 GB',
      cpu: '8 vCPUs',
      storage: '250 GB',
      gpu: 'RTX 3070',
      maxResolution: '4K',
    };
  } else {
    // Configuración por defecto para planes personalizados
    return {
      ram: '8 GB',
      cpu: '4 vCPUs',
      storage: '100 GB',
      gpu: 'Dedicada',
      maxResolution: '1440p',
    };
  }
};

const VMDashboard = ({ userId }: VMDashboardProps) => {
  const [vmStatus, setVmStatus] = useState<'stopped' | 'starting' | 'running' | 'stopping'>('stopped');
  const [vmIP, setVmIP] = useState<string>('');
  const { data: activePlan } = useActivePlan(userId);
  const { toast } = useToast();

  const vmSpecs = getVMSpecs(activePlan?.planName);

  const handleVMAction = async (action: 'start' | 'stop') => {
    if (!activePlan || activePlan.isExpired) {
      toast({
        title: "Plano necessário",
        description: "Você precisa de um plano ativo para usar a máquina virtual.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (action === 'start') {
        setVmStatus('starting');
        // Simular processo de inicialização
        await new Promise(resolve => setTimeout(resolve, 3000));
        setVmStatus('running');
        setVmIP('192.168.1.' + Math.floor(Math.random() * 100 + 100));
        
        toast({
          title: "Máquina virtual ligada",
          description: "Sua VM está pronta para uso. Use o IP fornecido para conectar via RDP.",
        });
      } else {
        setVmStatus('stopping');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setVmStatus('stopped');
        setVmIP('');
        
        toast({
          title: "Máquina virtual desligada",
          description: "Sua VM foi desligada com segurança.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na operação",
        description: "Ocorreu um erro ao gerenciar a máquina virtual.",
        variant: "destructive",
      });
      setVmStatus('stopped');
    }
  };

  if (!activePlan || activePlan.isExpired) {
    return (
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Plano Necessário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Você precisa de um plano ativo para acessar sua máquina virtual.
          </p>
          <Button className="w-full" onClick={() => {
            document.getElementById('planos')?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }}>
            Ver Planos
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    switch (vmStatus) {
      case 'running': return 'bg-green-500';
      case 'starting': case 'stopping': return 'bg-yellow-500';
      case 'stopped': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (vmStatus) {
      case 'running': return 'Online';
      case 'starting': return 'Iniciando...';
      case 'stopping': return 'Desligando...';
      case 'stopped': return 'Offline';
      default: return 'Offline';
    }
  };

  return (
    <div className="space-y-6">
      {/* VM Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-cloud-blue" />
              Máquina Virtual - Plano {activePlan.planName}
            </div>
            <Badge className={`${getStatusColor()} text-white`}>
              {getStatusText()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* VM Specs */}
            {vmSpecs && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">RAM</p>
                  <p className="font-semibold">{vmSpecs.ram}</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">CPU</p>
                  <p className="font-semibold">{vmSpecs.cpu}</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Armazenamento</p>
                  <p className="font-semibold">{vmSpecs.storage}</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">GPU</p>
                  <p className="font-semibold">{vmSpecs.gpu}</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Resolução</p>
                  <p className="font-semibold">{vmSpecs.maxResolution}</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3" />
                    <p className="font-semibold text-xs">{getStatusText()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Connection Info */}
            {vmStatus === 'running' && vmIP && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Informações de Conexão
                </h4>
                <div className="space-y-1 text-sm">
                  <p><strong>IP:</strong> {vmIP}</p>
                  <p><strong>Porta:</strong> 3389 (RDP)</p>
                  <p><strong>Usuário:</strong> matecloud</p>
                  <p><strong>Senha:</strong> ********</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {vmStatus === 'stopped' && (
                <Button 
                  onClick={() => handleVMAction('start')}
                  className="flex-1"
                  size="lg"
                >
                  <Power className="w-4 h-4 mr-2" />
                  Ligar VM
                </Button>
              )}
              
              {vmStatus === 'running' && (
                <Button 
                  onClick={() => handleVMAction('stop')}
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                >
                  <Power className="w-4 h-4 mr-2" />
                  Desligar VM
                </Button>
              )}

              {(vmStatus === 'starting' || vmStatus === 'stopping') && (
                <Button disabled className="flex-1" size="lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {vmStatus === 'starting' ? 'Iniciando...' : 'Desligando...'}
                </Button>
              )}

              <Button variant="outline" size="lg">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>

            {/* Time Remaining */}
            <div className="text-center text-sm text-muted-foreground">
              Tempo restante no plano: {activePlan.daysRemaining} dias
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VMDashboard;