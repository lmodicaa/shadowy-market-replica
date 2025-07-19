import { useEffect } from 'react';
import { useLocation } from 'wouter';
import StarField from '@/components/StarField';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TutorialsSection from '@/components/TutorialsSection';

interface IndexProps {
  session: any;
}

const Index = ({ session }: IndexProps) => {
  const [location, navigate] = useLocation();

  useEffect(() => {
    // Limpiar la URL del hash después de la autenticación exitosa
    if (window.location.hash.includes('access_token=')) {
      // Use replace to clean the URL without adding to history
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [session]);

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
