import { useEffect } from 'react';
import { useLocation } from 'wouter';
import StarField from '@/components/StarField';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import { LazySection, LazyFeaturesSection, LazyPlansSection, LazyTutorialsSection } from '@/components/LazySection';

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
        <HeroSection />
        <LazySection>
          <LazyFeaturesSection />
        </LazySection>
        <LazySection>
          <LazyPlansSection session={session} />
        </LazySection>
        <LazySection>
          <LazyTutorialsSection />
        </LazySection>
      </main>
    </div>
  );
};

export default Index;
