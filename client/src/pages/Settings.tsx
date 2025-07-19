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
  Moon, 
  Sun, 
  Globe, 
  Database,
  Trash2,
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface SettingsProps {
  session: any;
}

const Settings = ({ session }: SettingsProps) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Detectar el modo oscuro actual
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    toast({
      title: "Tema actualizado",
      description: `Modo ${newDarkMode ? 'oscuro' : 'claro'} activado.`,
    });
  };

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
      // Simular exportación de datos
      const userData = {
        profile: {
          id: session?.user?.id,
          email: session?.user?.email,
          name: session?.user?.user_metadata?.full_name,
          created_at: session?.user?.created_at,
        },
        settings: {
          darkMode,
          notifications,
        },
        exported_at: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `matecloud_data_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast({
        title: "Datos exportados",
        description: "Tu información se ha descargado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      // En un entorno real, aquí harías la eliminación de la cuenta
      // Por ahora solo simulamos el proceso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Solicitud procesada",
        description: "La eliminación de cuenta requiere confirmación por email.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud de eliminación.",
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
            <p className="text-muted-foreground">Debes iniciar sesión para acceder a configuraciones.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configuraciones</h1>
            <p className="text-muted-foreground">Administra las preferencias de tu cuenta</p>
          </div>

          {/* Appearance Settings */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5" />
                Apariencia
              </CardTitle>
              <CardDescription>
                Personaliza como se ve la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Modo oscuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Activa el tema oscuro para una experiencia visual más cómoda
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-muted-foreground" />
                  <Switch
                    checked={darkMode}
                    onCheckedChange={handleDarkModeToggle}
                  />
                  <Moon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Settings */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificaciones
              </CardTitle>
              <CardDescription>
                Controla qué notificaciones quieres recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Notificaciones por email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe actualizaciones importantes por correo electrónico
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
                  <Label className="text-base">Notificaciones push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones en tiempo real en tu navegador
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
                    Recibe noticias y ofertas especiales
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
                Seguridad de la cuenta
              </CardTitle>
              <CardDescription>
                Información sobre la seguridad de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base">Autenticación</Label>
                  <Badge variant="secondary" className="capitalize">
                    {session.user?.app_metadata?.provider || 'discord'} OAuth
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Última sesión</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.user?.last_sign_in_at || session.user?.created_at).toLocaleString('es-ES')}
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
                Gestión de datos
              </CardTitle>
              <CardDescription>
                Controla tus datos personales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleExportData}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {loading ? 'Exportando...' : 'Exportar mis datos'}
                </Button>
                <Button 
                  variant="outline" 
                  disabled
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Importar datos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-card/50 backdrop-blur-sm border-red-500/20 border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Zona de peligro
              </CardTitle>
              <CardDescription>
                Acciones irreversibles para tu cuenta
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
                    Eliminar cuenta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta
                      y removerá todos tus datos de nuestros servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleteLoading ? 'Procesando...' : 'Eliminar cuenta'}
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