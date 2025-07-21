import { Power, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import logoImage from "@assets/logo_1753070520527.png";

const HeroSection = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const heroTexts = [
    "Acesse uma máquina virtual de alto desempenho e jogue seus títulos favoritos em qualquer dispositivo.",
    "RTX 4090 na nuvem com ray tracing em tempo real. Transforme qualquer dispositivo em um PC gamer.",
    "Latência ultra-baixa, performance máxima. Seus jogos AAA rodando a 144+ FPS instantaneamente.",
    "Sem downloads, sem instalações. Clique e jogue imediatamente com a melhor qualidade gráfica.",
    "Gaming em nuvem premium com armazenamento SSD NVMe e backup automático dos seus saves."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % heroTexts.length);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [heroTexts.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6">
      {/* Cloud Logo with Glow - Positioned better */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-2 mb-8 opacity-80 hover:opacity-100 transition-opacity duration-300">
          <img 
            src={logoImage} 
            alt="MateCloud Logo" 
            className="w-5 h-5 object-contain"
          />
          <span className="text-sm font-medium text-foreground/60">MateCloud</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight mt-16">
          Jogue em qualquer lugar
          <br />
          com <span className="text-cloud-blue">MateCloud</span>
        </h1>
        
        <div className="text-xl md:text-2xl text-foreground/70 mb-12 max-w-3xl mx-auto leading-relaxed h-24 flex items-center justify-center">
          <p 
            className={`transition-all duration-300 transform ${
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 -translate-y-2'
            }`}
          >
            {heroTexts[currentTextIndex]}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            variant="hero"
            className="text-lg px-8 py-4 shadow-xl"
            onClick={() => {
              // Redirecionar para a página de VM Dashboard (profile page)
              window.location.href = '/profile';
            }}
          >
            <Power className="w-5 h-5 mr-2" />
            Ligar VM
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-4 shadow-lg"
            onClick={() => {
              document.getElementById('planos')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }}
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