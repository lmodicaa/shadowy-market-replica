import { Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import logoImage from "@assets/logo_1753070520527.png";

const tutorials = [
  {
    title: 'Escolher um plano',
    description: 'Primeiro você escolhe seu plano e faz a assinatura. Em seguida poderá criar a sua máquina, ligar/desligar quando quiser em nossa dashboard. Em sua máquina aparecerá as informações de conexão.',
    thumbnail: 'https://i.ytimg.com/vi_webp/wHGsz7xctUI/sddefault.webp'
  },
  {
    title: 'Como utilizar',
    description: 'Na barra de pesquisa do windows pesquise RDP e abra o app de conexão remota que irá aparecer, coloque o IP fornecido no site e clique em conectar.',
    thumbnail: 'https://i.ytimg.com/vi_webp/xaVU2H6mCJg/sddefault.webp'
  }
];

const TutorialsSection = () => {
  return (
    <section id="tutoriais" className="py-20 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-card/20 backdrop-blur-sm border border-border/30">
              <img 
                src={logoImage} 
                alt="MateCloud Logo" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="text-lg font-semibold text-foreground/80">MateCloud | Tutoriais</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Tutoriais em Vídeo
          </h2>
          
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Confira nossos tutoriais para aprender a configurar e utilizar 
            sua máquina virtual na MateCloud.
          </p>
        </div>

        {/* Tutorials Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {tutorials.map((tutorial, index) => (
            <Card 
              key={index} 
              className="hover:border-cloud-blue/40 transition-all duration-300 overflow-hidden group hover:shadow-xl"
            >
              <div className="relative">
                <img 
                  src={tutorial.thumbnail} 
                  alt={tutorial.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                  <Button 
                    size="lg" 
                    variant="hero"
                    className="shadow-xl"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    Assistir
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-2xl font-semibold mb-4 text-foreground">
                  {tutorial.title}
                </h3>
                
                <p className="text-foreground/70 leading-relaxed">
                  {tutorial.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TutorialsSection;