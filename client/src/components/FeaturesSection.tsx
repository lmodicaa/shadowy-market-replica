import { Smartphone, Cpu, Wifi, HardDrive } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { OptimizedPicture } from './OptimizedPicture';
import logoWebp from "@assets/logo.webp";
import logoAvif from "@assets/logo.avif";
import { LazyImage } from './LazyImage';

const features = [
  {
    icon: Smartphone,
    title: 'Gaming Multiplataforma',
    description: 'Transforme qualquer dispositivo em um console de alta performance. Jogue AAA titles no seu smartphone, tablet ou laptop antigo com a mesma qualidade.'
  },
  {
    icon: Cpu,
    title: 'NVIDIA & AMD',
    description: 'Máquinas virtuais equipadas com as placas de vídeo e processadores mais avançados do mercado. Ray tracing em tempo real e 60+ FPS garantidos.'
  },
  {
    icon: Wifi,
    title: 'Rede Otimizada',
    description: 'Infraestrutura de fibra óptica dedicada com edge computing. Latência ultra-baixa de menos de 38ms para uma experiência responsiva e fluida.'
  },
  {
    icon: HardDrive,
    title: 'SSD NVMe Exclusivo',
    description: 'Armazenamento pessoal de alta velocidade com backup automático. Instale até 500GB de jogos com carregamento instantâneo e saves sincronizados.'
  }
];

const FeaturesSection = () => {

  return (
    <section id="faq" className="py-20 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <OptimizedPicture 
              src={logoWebp} 
              webpSrc={logoWebp}
              avifSrc={logoAvif}
              alt="MateCloud Logo - Cloud Gaming Platform" 
              className="w-5 h-5"
              width={20}
              height={20}
              loading="lazy"
            />
            <span className="text-lg font-semibold text-foreground/80">MateCloud | FAQ</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Por que escolher a
            <span className="text-cloud-blue"> MateCloud</span>
          </h2>
          
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Nossa plataforma oferece a melhor experiência de cloud gaming, com recursos 
            projetados para garantir desempenho, qualidade e acessibilidade.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover:border-cloud-blue/40 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl"
            >
              <CardContent className="p-6 text-center">
                <div className="inline-flex p-3 rounded-xl bg-card/30 backdrop-blur-sm border border-border/30 mb-4">
                  <feature.icon className="w-8 h-8 text-cloud-blue" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                
                <p className="text-foreground/70 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;