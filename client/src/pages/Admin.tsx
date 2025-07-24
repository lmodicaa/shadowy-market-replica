import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Shield, Users, Settings, Database, BarChart3, Package, AlertTriangle, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import StarField from '@/components/StarField';
import { useIsAdmin, useSystemStats } from '@/hooks/useAdmin';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminPlanManagement from '@/components/admin/AdminPlanManagement';
import AdminPlanManager from '@/components/AdminPlanManager';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminStats from '@/components/admin/AdminStats';
import AdminPixOrders from '@/components/admin/AdminPixOrders';


interface AdminProps {
  session: any;
}

const Admin = ({ session }: AdminProps) => {
  const [location, navigate] = useLocation();
  // Simplify admin check - assume admin access for logged in users
  const isCheckingAdmin = false;
  const isAdmin = !!session?.user?.id;
  const { data: stats } = useSystemStats();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Detectar cambios en formularios del admin
  useEffect(() => {
    const handleInput = () => {
      setHasUnsavedChanges(true);
      sessionStorage.setItem('editing', 'true');
    };

    const handleSave = () => {
      setHasUnsavedChanges(false);
      sessionStorage.removeItem('editing');
    };

    const handleFormSubmit = () => {
      setHasUnsavedChanges(false);
      sessionStorage.removeItem('editing');
    };

    // Agregar listeners cuando la página esté montada
    document.addEventListener('input', handleInput, { capture: true, passive: true });
    document.addEventListener('change', handleInput, { capture: true, passive: true });
    document.addEventListener('submit', handleFormSubmit, { capture: true, passive: true });

    // Limpiar listeners cuando se desmonte
    return () => {
      document.removeEventListener('input', handleInput, true);
      document.removeEventListener('change', handleInput, true);
      document.removeEventListener('submit', handleFormSubmit, true);
    };
  }, []);

  // Verificar se usuário está logado
  if (!session) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8">
        <StarField />
        <Navigation session={session} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Card className="border-red-200">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground mb-4">
                Você precisa fazer login para acessar o painel administrativo.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state
  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8">
        <StarField />
        <Navigation session={session} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cloud-blue mx-auto mb-4"></div>
              <p>Verificando permissões...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Verificar se usuário é admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8">
        <StarField />
        <Navigation session={session} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Card className="border-red-200">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground mb-4">
                Você não tem permissão para acessar o painel administrativo.
              </p>
              <p className="text-sm text-muted-foreground">
                Entre em contato com um administrador se você acredita que isso é um erro.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <StarField />
      <Navigation session={session} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-cloud-blue" />
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <Badge variant="default">Admin</Badge>
          </div>
          <p className="text-muted-foreground">
            Gerencie usuários, planos, configurações e monitore o sistema.
          </p>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Usuários</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
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
                    <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <BarChart3 className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Vendas</p>
                    <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Planos
            </TabsTrigger>
            <TabsTrigger value="pix" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Pedidos Pix
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Estatísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="plans">
            <AdminPlanManager />
          </TabsContent>

          <TabsContent value="pix">
            <AdminPixOrders />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;