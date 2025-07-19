import StarField from '@/components/StarField';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TutorialsSection from '@/components/TutorialsSection';

const Index = () => {
  return (
    <div className="relative min-h-screen">
      {/* Animated Star Field Background */}
      <StarField />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <TutorialsSection />
      </main>
    </div>
  );
};

export default Index;
