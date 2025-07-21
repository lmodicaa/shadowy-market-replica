import { Play, Clock, Sparkles, CreditCard, Monitor } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import logoImage from "@assets/logo.png";

const tutorials = [
  {
    title: 'Configuração Inicial da Conta',
    description: 'Aprenda a criar sua conta MateCloud, selecionar o plano ideal para suas necessidades de gaming e configurar sua primeira máquina virtual. Descubra todas as opções de personalização disponíveis.',
    icon: 'plan',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    title: 'Conectando à sua VM',
    description: 'Tutorial completo sobre como estabelecer conexão remota com sua máquina virtual. Configurações de rede, instalação de clientes RDP e otimização para melhor performance de jogos.',
    icon: 'connect',
    gradient: 'from-violet-500 to-purple-600'
  }
];

const TutorialsSection = () => {
  return (
    <section id="tutoriais" className="py-20 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src={logoImage} 
              alt="MateCloud Logo" 
              className="w-6 h-6 object-contain"
            />
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
              <div className="relative h-48 overflow-hidden">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tutorial.gradient} opacity-90`}></div>
                
                {/* Pattern overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
                
                {/* Large icon in background */}
                <div className="absolute top-4 right-4 opacity-20">
                  {tutorial.icon === 'plan' ? (
                    <CreditCard className="w-20 h-20 text-white" />
                  ) : (
                    <Monitor className="w-20 h-20 text-white" />
                  )}
                </div>
                
                {/* MateCloud logo */}
                <div className="absolute top-4 left-4">
                  <img 
                    src={logoImage} 
                    alt="MateCloud Logo" 
                    className="w-8 h-8 object-contain opacity-60"
                  />
                </div>
                
                {/* Coming soon badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center group-hover:from-black/40 transition-all duration-300">
                  <div className="bg-gradient-to-r from-cloud-blue/90 to-cloud-blue-dark/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-2xl border border-white/20 transform group-hover:scale-110 transition-all duration-300">
                    <div className="flex items-center gap-2 text-white">
                      <div className="relative">
                        <Clock className="w-5 h-5" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      </div>
                      <span className="font-semibold text-sm">Em breve</span>
                      <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                    </div>
                  </div>
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