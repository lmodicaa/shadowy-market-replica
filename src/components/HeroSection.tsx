import { Cloud, Power, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6">
      {/* Cloud Logo with Glow - Positioned better */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-2 mb-8 opacity-80 hover:opacity-100 transition-opacity duration-300">
          <div className="p-2 rounded-lg bg-card/10 backdrop-blur-sm border border-cloud-blue/20">
            <Cloud className="w-5 h-5 text-cloud-blue" />
          </div>
          <span className="text-sm font-medium text-foreground/60">DarkCloud</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight mt-16">
          Jogue em qualquer lugar
          <br />
          com <span className="text-cloud-blue">DarkCloud</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-foreground/70 mb-12 max-w-3xl mx-auto leading-relaxed">
          Acesse uma máquina virtual de alto desempenho e jogue seus títulos 
          favoritos em qualquer dispositivo, com gráficos impressionantes e baixa latência.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            variant="hero"
            className="text-lg px-8 py-4 shadow-xl"
          >
            <Power className="w-5 h-5 mr-2" />
            Ligar VM
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-4 shadow-lg"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Ver planos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;