import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, User, Edit2, Save, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface ProfileProps {
  session: any;
}

const Profile = ({ session }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user) {
      setDisplayName(session.user.user_metadata?.full_name || '');
      setBio(session.user.user_metadata?.bio || '');
    }
  }, [session]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: displayName,
          bio: bio
        }
      });

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente.",
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil.",
        variant: "destructive",
      });
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(session?.user?.user_metadata?.full_name || '');
    setBio(session?.user?.user_metadata?.bio || '');
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Debes iniciar sesión para ver tu perfil.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
              <p className="text-muted-foreground">Gestiona tu información personal</p>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button onClick={handleCancel} variant="outline" disabled={loading}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          {/* Profile Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/30">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={session.user?.user_metadata?.avatar_url} 
                    alt={displayName || 'Usuario'} 
                  />
                  <AvatarFallback className="bg-cloud-blue/20 text-cloud-blue text-2xl">
                    {displayName?.charAt(0) || session.user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="displayName">Nombre</Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Tu nombre completo"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <CardTitle className="text-2xl">{displayName || 'Usuario'}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" />
                        {session.user?.email}
                      </CardDescription>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bio Section */}
              <div>
                <Label className="text-base font-medium">Biografía</Label>
                {isEditing ? (
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Cuéntanos un poco sobre ti..."
                    rows={3}
                    className="mt-2"
                  />
                ) : (
                  <p className="text-muted-foreground mt-2">
                    {bio || 'No has agregado una biografía aún.'}
                  </p>
                )}
              </div>

              {/* Account Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Información de la Cuenta</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">ID: {session.user?.id?.slice(0, 8)}...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          Miembro desde: {formatDate(session.user?.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Proveedor de Autenticación</Label>
                    <div className="mt-2">
                      <Badge variant="secondary" className="capitalize">
                        {session.user?.app_metadata?.provider || 'discord'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sesiones iniciadas</span>
                    <span className="font-medium">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Última actividad</span>
                    <span className="font-medium">
                      {formatDate(session.user?.last_sign_in_at || session.user?.created_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="text-lg">Preferencias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Idioma</span>
                    <span className="font-medium">Español</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Zona horaria</span>
                    <span className="font-medium">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;