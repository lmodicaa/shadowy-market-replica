import { Cloud, Power, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6">
      {/* Cloud Logo with Glow */}
      <div className="absolute top-1/3 transform -translate-y-1/2">
        <div className="flex items-center gap-3 mb-8 float-animation">
          <div className="p-3 rounded-xl bg-card/20 backdrop-blur-sm border border-border/30 shadow-lg">
            <Cloud className="w-8 h-8 text-cloud-blue" />
          </div>
          <span className="text-lg font-semibold text-foreground/80">DarkCloud</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center max-w-4xl mx-auto mt-20">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
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