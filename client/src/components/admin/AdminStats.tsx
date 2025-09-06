import { BarChart3, Users, Package, Activity, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemStats, useAllUsers, useAllSubscriptions } from '@/hooks/useAdmin';

const AdminStats = () => {
  const { data: stats } = useSystemStats();
  const { data: users } = useAllUsers();
  const { data: subscriptions } = useAllSubscriptions();

  // Calculate additional statistics
  const getStatistics = () => {
    if (!users || !subscriptions) return null;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // New users this week/month
    const newUsersThisWeek = users.filter(user => 
      new Date(user.created_at) >= oneWeekAgo
    ).length;

    const newUsersThisMonth = users.filter(user => 
      new Date(user.created_at) >= oneMonthAgo
    ).length;

    // Active subscriptions by plan
    const planCounts = users.reduce((acc, user) => {
      if (user.active_plan) {
        acc[user.active_plan] = (acc[user.active_plan] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Revenue calculation (simplified)
    const planPrices = { 'Básico': 49, 'Gamer': 99, 'Pro': 199 };
    const monthlyRevenue = Object.entries(planCounts).reduce((total, [plan, count]) => {
      return total + (planPrices[plan as keyof typeof planPrices] || 0) * (count as number);
    }, 0);

    // Churn analysis
    const expiredSubscriptions = users.filter(user => 
      user.active_plan_until && new Date(user.active_plan_until) < now
    ).length;

    return {
      newUsersThisWeek,
      newUsersThisMonth,
      planCounts,
      monthlyRevenue,
      expiredSubscriptions,
    };
  };

  const statistics = getStatistics();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                {statistics && (
                  <p className="text-xs text-green-600">
                    +{statistics.newUsersThisWeek} esta semana
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Assinaturas Ativas</p>
                <p className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</p>
                {statistics && (
                  <p className="text-xs text-red-600">
                    {statistics.expiredSubscriptions} expiraram
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Receita Mensal</p>
                <p className="text-2xl font-bold">
                  {statistics ? formatCurrency(statistics.monthlyRevenue) : 'R$ 0'}
                </p>
                <p className="text-xs text-muted-foreground">Estimativa atual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Activity className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Novos Usuários</p>
                <p className="text-2xl font-bold">{statistics?.newUsersThisMonth || 0}</p>
                <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Distribuição por Planos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statistics?.planCounts ? (
            <div className="space-y-4">
              {Object.entries(statistics.planCounts).map(([plan, count]) => {
                const percentage = stats?.activeSubscriptions 
                  ? ((count as number) / stats.activeSubscriptions) * 100 
                  : 0;
                
                return (
                  <div key={plan} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Plano {plan}</span>
                      <span className="text-muted-foreground">
                        {count as number} usuários ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-cloud-blue h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum dado de planos disponível
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuários Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users ? (
              <div className="space-y-3">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{user.username || 'Sem nome'}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {user.id.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {user.active_plan || 'Sem plano'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Carregando usuários...
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Assinaturas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions ? (
              <div className="space-y-3">
                {subscriptions.slice(0, 5).map((subscription: any) => (
                  <div key={subscription.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Plano {subscription.plan_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {subscription.profiles?.username || 'Usuário'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatDate(subscription.created_at)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expira: {formatDate(subscription.end_date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Carregando assinaturas...
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="font-medium">Banco de Dados</p>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="font-medium">Autenticação</p>
              <p className="text-sm text-muted-foreground">Funcionando</p>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="font-medium">Serviços VM</p>
              <p className="text-sm text-muted-foreground">Operacional</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;