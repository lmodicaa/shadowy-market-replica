import { Cloud, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@supabase/supabase-js';

// Reemplaza con la URL y clave pública de anon de tu proyecto Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Navigation = ({ session }: { session: any }) => {

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: window.location.origin, // O la URL a la que quieras redirigir después del login
        },
      });
      if (error) throw error;
      // Si no hay error, Supabase redirigirá al usuario al proveedor de OAuth
    } catch (error) {
      console.error('Error al iniciar sesión con Discord:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
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

        {/* Login Button */}
        {session ? (
          <Button 
            variant="hero" 
            className="shadow-lg"
            // Aquí podrías agregar una función de logout
          >
            Logout
          </Button>
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
