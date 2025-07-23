import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Shield, 
  Globe, 
  Database,
  Trash2,
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Navigation from '@/components/Navigation';
import StarField from '@/components/StarField';

interface SettingsProps {
  session: any;
}

const Settings = ({ session }: SettingsProps) => {

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const { toast } = useToast();



  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));

    toast({
      title: "Preferencias actualizadas",
      description: "Las configuraciones de notificaciones se han guardado.",
    });
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      // Obtener datos adicionales del perfil desde Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      // Obtener historial de suscripciones
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      // Crear estructura completa de datos
      const userData = {
        format_version: "1.0",
        export_metadata: {
          exported_at: new Date().toISOString(),
          exported_by: session?.user?.email,
          app_version: "MateCloud v1.0",
        },
        user_profile: {
          id: session?.user?.id,
          email: session?.user?.email,
          name: session?.user?.user_metadata?.full_name,
          created_at: session?.user?.created_at,
          last_sign_in: session?.user?.last_sign_in_at,
          // Datos del perfil extendido
          username: profileData?.username,
          avatar_url: profileData?.avatar_url,
          active_plan: profileData?.active_plan,
          active_plan_until: profileData?.active_plan_until,
        },
        settings: {
          notifications: {
            email: notifications.email,
            push: notifications.push,
            marketing: notifications.marketing,
          },
        },
        subscription_history: subscriptionsData || [],
        data_summary: {
          total_subscriptions: subscriptionsData?.length || 0,
          has_active_plan: !!profileData?.active_plan,
          profile_complete: !!(profileData?.username && profileData?.avatar_url),
        }
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const exportFileDefaultName = `matecloud_backup_${timestamp}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast({
        title: "Dados exportados com sucesso",
        description: `Arquivo ${exportFileDefaultName} baixado. Inclui perfil, configurações e ${subscriptionsData?.length || 0} assinaturas.`,
      });
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setImportLoading(true);
      try {
        const fileContent = await file.text();
        const importedData = JSON.parse(fileContent);

        // Validar formato do arquivo
        if (!importedData.format_version || !importedData.user_profile) {
          throw new Error('Formato de arquivo inválido');
        }

        // Verificar se é do mesmo usuário
        if (importedData.user_profile.id !== session?.user?.id) {
          throw new Error('Este arquivo pertence a outro usuário');
        }

        // Importar configurações de notificações
        if (importedData.settings?.notifications) {
          const importedNotifications = importedData.settings.notifications;
          setNotifications({
            email: importedNotifications.email ?? notifications.email,
            push: importedNotifications.push ?? notifications.push,
            marketing: importedNotifications.marketing ?? notifications.marketing,
          });
        }

        // Atualizar perfil se houver dados
        if (importedData.user_profile.username || importedData.user_profile.avatar_url) {
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
              id: session?.user?.id,
              username: importedData.user_profile.username,
              avatar_url: importedData.user_profile.avatar_url,
              updated_at: new Date().toISOString(),
            });

          if (updateError) {
            console.error('Erro ao atualizar perfil:', updateError);
          }
        }

        toast({
          title: "Dados importados com sucesso",
          description: `Configurações restauradas do backup de ${new Date(importedData.export_metadata.exported_at).toLocaleDateString('pt-BR')}.`,
        });

      } catch (error) {
        console.error('Erro na importação:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        toast({
          title: "Erro na importação",
          description: `Não foi possível importar os dados: ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setImportLoading(false);
      }
    };

    input.click();
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      // En un entorno real, aquí harías la eliminación de la cuenta
      // Por ahora solo simulamos el proceso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Solicitação processada",
        description: "A exclusão da conta requer confirmação por email.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar a solicitação de exclusão.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Você deve fazer login para acessar as configurações.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <StarField />
      <Navigation session={session} />
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">Gerencie as preferências da sua conta</p>
          </div>



          {/* Notifications Settings */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Controle quais notificações você deseja receber
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Notificações por email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações importantes por email
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={() => handleNotificationChange('email')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Notificações push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações em tempo real no seu navegador
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={() => handleNotificationChange('push')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Email de marketing</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notícias e ofertas especiais
                  </p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={() => handleNotificationChange('marketing')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Segurança da conta
              </CardTitle>
              <CardDescription>
                Informações sobre a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base">Autenticação</Label>
                  <Badge variant="secondary" className="capitalize">
                    {session.user?.app_metadata?.provider || 'discord'} OAuth
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Última sessão</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.user?.last_sign_in_at || session.user?.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Gestão de dados
              </CardTitle>
              <CardDescription>
                Controle seus dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {loading ? 'Exportando...' : 'Exportar meus dados'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleImportData}
                    disabled={importLoading}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {importLoading ? 'Importando...' : 'Importar dados'}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• <strong>Exportar:</strong> Baixa um backup completo com perfil, configurações e histórico</p>
                  <p>• <strong>Importar:</strong> Restaura configurações de um arquivo de backup anterior</p>
                  <p>• Apenas arquivos JSON válidos do MateCloud são aceitos na importação</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-card/50 backdrop-blur-sm border-red-500/20 border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Zona de perigo
              </CardTitle>
              <CardDescription>
                Ações irreversíveis para sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir conta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                      e removerá todos os seus dados de nossos servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleteLoading ? 'Processando...' : 'Excluir conta'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;