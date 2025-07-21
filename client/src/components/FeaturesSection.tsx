import { Smartphone, Cpu, Wifi, HardDrive } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import logoImage from "@assets/logo_1753070520527.png";

const features = [
  {
    icon: Smartphone,
    title: 'Jogue em qualquer dispositivo',
    description: 'Acesse sua máquina virtual de qualquer lugar, em qualquer dispositivo com conexão à internet.'
  },
  {
    icon: Cpu,
    title: 'Hardware de alto desempenho',
    description: 'Equipamentos de última geração para rodar seus jogos com gráficos impressionantes e alta taxa de quadros.'
  },
  {
    icon: Wifi,
    title: 'Baixa latência',
    description: 'Servidores estrategicamente posicionados para garantir a menor latência possível durante suas sessões de jogo.'
  },
  {
    icon: HardDrive,
    title: 'Armazenamento dedicado',
    description: 'Espaço de armazenamento exclusivo para instalar seus jogos favoritos e salvar seu progresso.'
  }
];

const FeaturesSection = () => {
  return (
    <section id="faq" className="py-20 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src={logoImage} 
              alt="MateCloud Logo" 
              className="w-6 h-6 object-contain"
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