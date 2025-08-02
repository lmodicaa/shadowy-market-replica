import { Calendar, Clock, Crown, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useActivePlan } from '@/hooks/useActivePlan';

interface UserPlanStatusProps {
  userId?: string;
  onUpgrade?: () => void;
}

const UserPlanStatus = ({ userId, onUpgrade }: UserPlanStatusProps) => {
  const { data: activePlan, isLoading, error } = useActivePlan(userId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>Erro ao carregar informações do plano</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activePlan) {
    return (
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-600" />
            Nenhum Plano Ativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Você não possui um plano ativo. Escolha um plano para começar a usar o MateCloud.
          </p>
          <Button onClick={onUpgrade} className="w-full">
            Escolher Plano
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (activePlan.isExpired) return 'bg-red-500';
    if (activePlan.daysRemaining <= 3) return 'bg-amber-500';
    if (activePlan.daysRemaining <= 7) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (activePlan.isExpired) return 'Expirado';
    if (activePlan.daysRemaining <= 3) return 'Expira em breve';
    return 'Ativo';
  };

  return (
    <Card className={activePlan.isExpired ? 'border-red-200' : 'border-green-200'}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-cloud-blue" />
            Plano {String(activePlan.planName || 'Desconhecido')}
          </div>
          <Badge className={`${getStatusColor()} text-white`}>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              Expira em: {new Date(String(activePlan.expirationDate || new Date())).toLocaleDateString('pt-BR')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {activePlan.isExpired 
                ? 'Plano expirado' 
                : `${activePlan.daysRemaining} dias restantes`
              }
            </span>
          </div>

          {(activePlan.isExpired || activePlan.daysRemaining <= 7) && (
            <div className="pt-4">
              <Button 
                onClick={onUpgrade} 
                className="w-full"
                variant={activePlan.isExpired ? "default" : "outline"}
              >
                {activePlan.isExpired ? 'Renovar Plano' : 'Estender Plano'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPlanStatus;