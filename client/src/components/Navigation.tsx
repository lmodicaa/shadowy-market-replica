import { Cloud, ExternalLink, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@supabase/supabase-js';
import { useLocation } from 'wouter';

// Reemplaza con la URL y clave pública de anon de tu proyecto Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Navigation = ({ session }: { session: any }) => {
  const [, navigate] = useLocation();

  const handleLogin = async () => {
    try {
      // Use the current window location origin, which will be the Replit URL
      const redirectUrl = window.location.origin;
      
      console.log('Attempting login with redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
      // Si no hay error, Supabase redirigirá al usuario al proveedor de OAuth
    } catch (error) {
      console.error('Error al iniciar sesión con Discord:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('Usuario cerró sesión exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-card/20 backdrop-blur-sm border border-border/30">
            <Cloud className="w-6 h-6 text-cloud-blue" />
          </div>
          <span className="text-xl font-bold text-foreground">MateCloud</span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#inicio" className="text-foreground/90 hover:text-cloud-blue transition-colors">
            Início
          </a>
          <a href="#assinatura" className="text-foreground/90 hover:text-cloud-blue transition-colors">
            Assinatura
          </a>
          <a 
            href="#discord" 
            className="flex items-center gap-1 text-foreground/90 hover:text-cloud-blue transition-colors"
          >
            Discord
            <ExternalLink className="w-3 h-3" />
          </a>
          <a href="#faq" className="text-foreground/90 hover:text-cloud-blue transition-colors">
            FAQ
          </a>
        </div>

        {/* User Menu / Login Button */}
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 h-auto p-2 hover:bg-card/20 border border-border/30 backdrop-blur-sm"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={session.user?.user_metadata?.avatar_url} 
                    alt={session.user?.user_metadata?.full_name || 'Usuario'} 
                  />
                  <AvatarFallback className="bg-cloud-blue/20 text-cloud-blue">
                    {session.user?.user_metadata?.full_name?.charAt(0) || 
                     session.user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">
                    {session.user?.user_metadata?.full_name || 'Usuario'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.user?.email}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-sm border border-border/30">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-card/20"
                onClick={() => navigate('/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-card/20"
                onClick={() => navigate('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuraciones</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-card/20 text-red-600 dark:text-red-400"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="hero" 
            className="shadow-lg"
            onClick={handleLogin}
          >
            Login
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
