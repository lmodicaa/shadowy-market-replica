import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserX, UserCheck, AlertTriangle, RefreshCw } from 'lucide-react';

const RegistrationStatus = () => {
  const { data: registrationStatus, isLoading, refetch } = useQuery({
    queryKey: ['registrationStatus'],
    queryFn: async () => {
      const response = await fetch('/api/admin/registration-status');
      if (!response.ok) {
        throw new Error('Failed to fetch registration status');
      }
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Verificando status de registros...</span>
        </CardContent>
      </Card>
    );
  }

  const enabled = registrationStatus?.enabled;

  return (
    <Card className={`w-full ${enabled ? 'border-green-200' : 'border-red-200'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {enabled ? (
            <UserCheck className="w-5 h-5 text-green-600" />
          ) : (
            <UserX className="w-5 h-5 text-red-600" />
          )}
          Status de Registros
          <Badge variant={enabled ? "default" : "destructive"} className="ml-2">
            {enabled ? "ATIVO" : "BLOQUEADO"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {enabled ? (
              "✅ Novos usuários podem se registrar via Discord OAuth"
            ) : (
              "🚫 Novos registros estão bloqueados. Usuários tentando se registrar serão automaticamente desconectados."
            )}
          </p>
          
          {!enabled && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Usuários existentes não são afetados por esta configuração
              </span>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Última verificação: {new Date(registrationStatus?.timestamp || Date.now()).toLocaleString('pt-BR')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegistrationStatus;