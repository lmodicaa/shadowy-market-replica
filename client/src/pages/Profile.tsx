import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, User, Edit2, Save, X, History } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import UserPlanStatus from '@/components/UserPlanStatus';
import VMDashboard from '@/components/VMDashboard';
import { useUserProfile, useSubscriptionHistory } from '@/hooks/useUserProfile';
import { useActivePlan } from '@/hooks/useActivePlan';

interface ProfileProps {
  session: any;
}

const Profile = ({ session }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Hooks para dados do usuário
  const { data: userProfile } = useUserProfile(session?.user?.id);
  const { data: subscriptionHistory } = useSubscriptionHistory(session?.user?.id);

  useEffect(() => {
    if (session?.user) {
      setDisplayName(session.user.user_metadata?.full_name || '');
      setBio(session.user.user_metadata?.bio || '');
    }
  }, [session]);

  // Prevenir recargas cuando está editando
  useEffect(() => {
    if (isEditing) {
      sessionStorage.setItem('editing', 'true');
    } else {
      sessionStorage.removeItem('editing');
    }
  }, [isEditing]);

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
    return new Date(dateString).toLocaleDateString('pt-BR', {
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
            <p className="text-muted-foreground">Você deve fazer login para ver seu perfil.</p>
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
              <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
              <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
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
                  {loading ? 'Salvando...' : 'Salvar'}
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
                    alt={displayName || 'Usuário'} 
                  />
                  <AvatarFallback className="bg-cloud-blue/20 text-cloud-blue text-2xl">
                    {displayName?.charAt(0) || session.user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="displayName">Nome</Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Seu nome completo"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <CardTitle className="text-2xl">{displayName || 'Usuário'}</CardTitle>
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
                <Label className="text-base font-medium">Biografia</Label>
                {isEditing ? (
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte-nos um pouco sobre você..."
                    rows={3}
                    className="mt-2"
                  />
                ) : (
                  <p className="text-muted-foreground mt-2">
                    {bio || 'Você ainda não adicionou uma biografia.'}
                  </p>
                )}
              </div>

              {/* Account Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-cloud-blue" />
                  <div>
                    <p className="text-sm font-medium">Membro desde</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(session.user?.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <User className="w-5 h-5 text-cloud-blue" />
                  <div>
                    <p className="text-sm font-medium">Tipo de conta</p>
                    <Badge variant="secondary">Usuário Discord</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VM Dashboard */}
          <VMDashboard userId={session?.user?.id} />

          {/* Plan Status Card */}
          <UserPlanStatus 
            userId={session?.user?.id}
            onUpgrade={() => {
              document.getElementById('planos')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
              window.location.href = '/#planos';
            }}
          />

          {/* Subscription History */}
          {subscriptionHistory && subscriptionHistory.length > 0 && (
            <Card className="bg-card/50 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Histórico de Assinaturas
                </CardTitle>
                <CardDescription>
                  Suas assinaturas anteriores e atuais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subscriptionHistory.map((subscription: any) => (
                    <div key={subscription.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">Plano {subscription.plan_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Criado em {formatDate(subscription.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Expira em {formatDate(subscription.end_date)}
                        </p>
                        <Badge variant={new Date(subscription.end_date) > new Date() ? "default" : "secondary"}>
                          {new Date(subscription.end_date) > new Date() ? "Ativo" : "Expirado"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;