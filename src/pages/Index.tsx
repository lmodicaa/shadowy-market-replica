import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
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
  const navigate = useNavigate(); // Obtener la función de navegación

  useEffect(() => {
    // Este efecto se ejecuta al cargar la página
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session); // Actualizar el estado con la sesión
      if (session) {
        console.log('Usuario autenticado:', session.user);
        // Usar navigate.replace para limpiar la URL
        navigate('/', { replace: true });
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
      {/* Pasamos la sesión al componente Navigation si es necesario */}
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
