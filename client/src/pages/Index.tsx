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
    // Manejar la URL al cargar la página
    if (window.location.hash.includes('access_token=')) {
      console.log('URL con token, redirigiendo para limpiar.');
      navigate('/');
      return; // Salir del efecto después de redirigir
    }

    // Este efecto se ejecuta al cargar la página y al cambiar el estado de autenticación
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        console.log('Usuario autenticado:', session.user);
        // navigate('/', { replace: true }); // Ya manejado arriba si la URL tiene el token
      } else {
        console.log('Usuario no autenticado');
      }
    });

    // Limpiar la suscripción al desmontar el componente
    return () => data.subscription.unsubscribe();
  }, [navigate]); // Agregar navigate como dependencia

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
