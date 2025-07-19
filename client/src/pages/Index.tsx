import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import StarField from '@/components/StarField';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TutorialsSection from '@/components/TutorialsSection';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Index = () => {
  const [session, setSession] = useState(null);
  const [location, navigate] = useLocation();

  useEffect(() => {
    // Este efecto se ejecuta al cargar la página y al cambiar el estado de autenticación
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      setSession(session);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('Usuario autenticado:', session.user.email);
        // Limpiar la URL del hash después de la autenticación exitosa
        if (window.location.hash.includes('access_token=')) {
          // Use replace to clean the URL without adding to history
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('Usuario cerró sesión');
        setSession(null);
      }
    });

    // Limpiar la suscripción al desmontar el componente
    return () => data.subscription.unsubscribe();
  }, []); // Remover navigate de las dependencias

  return (
    <div className="relative min-h-screen">
      {/* Animated Star Field Background */}
      <StarField />

      {/* Navigation */}
      <Navigation session={session} />

      {/* Main Content */}
      <main className="relative z-10">
        {/* Ejemplo de contenido condicional */}
        {session ? (
          <div>
            <h2>¡Bienvenido, {session.user.email}!</h2>
            {/* Aquí puedes agregar contenido para usuarios logueados */}
          </div>
        ) : (
          <>
            <HeroSection />
            <FeaturesSection />
            <TutorialsSection />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
