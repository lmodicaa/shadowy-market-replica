import { Check, Crown, Zap, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    name: 'Básico',
    price: 'R$ 49',
    period: '/mês',
    description: 'Ideal para jogos casuais e sessões curtas',
    features: [
      '4 GB RAM',
      '2 vCPUs',
      '50 GB Armazenamento',
      '10 horas/mês',
      'Suporte por email',
      'Resolução até 1080p'
    ],
    icon: Zap,
    popular: false
  },
  {
    name: 'Gamer',
    price: 'R$ 99',
    period: '/mês',
    description: 'Perfeito para gamers intermediários',
    features: [
      '8 GB RAM',
      '4 vCPUs',
      '100 GB Armazenamento',
      '30 horas/mês',
      'Suporte prioritário',
      'Resolução até 1440p',
      'GPU dedicada'
    ],
    icon: Star,
    popular: true
  },
  {
    name: 'Pro',
    price: 'R$ 199',
    period: '/mês',
    description: 'Para profissionais e streamers',
    features: [
      '16 GB RAM',
      '8 vCPUs',
      '250 GB Armazenamento',
      'Horas ilimitadas',
      'Suporte 24/7',
      'Resolução até 4K',
      'GPU RTX dedicada',
      'Streaming integrado'
    ],
    icon: Crown,
    popular: false
  }
];

const PlansSection = () => {
  const handleSelectPlan = (planName: string) => {
    // Implementar lógica de seleção do plano
    console.log(`Plano selecionado: ${planName}`);
    
    // Simular redirecionamento para página de checkout
    const checkoutUrl = `https://checkout.matecloud.com.br/plan/${planName.toLowerCase()}`;
    
    // Por enquanto, vamos mostrar um alerta
    alert(`Você selecionou o plano ${planName}!\n\nEm breve você será redirecionado para finalizar a compra.`);
    
    // Em um cenário real, você redirecionaria para:
    // window.open(checkoutUrl, '_blank');
  };

  return (
    <section id="planos" className="py-20 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Escolha seu <span className="text-cloud-blue">Plano</span>
          </h2>
          
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Selecione o plano que melhor se adapta às suas necessidades de gaming. 
            Todos os planos incluem acesso completo à nossa plataforma.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative hover:border-cloud-blue/40 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl ${
                plan.popular ? 'border-cloud-blue/60 shadow-lg scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-cloud-blue text-white px-4 py-1">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="inline-flex p-3 rounded-xl bg-card/30 backdrop-blur-sm border border-border/30 mb-4 mx-auto">
                  <plan.icon className="w-8 h-8 text-cloud-blue" />
                </div>
                
                <CardTitle className="text-2xl font-bold text-foreground">
                  {plan.name}
                </CardTitle>
                
                <div className="flex items-baseline justify-center gap-1 mt-4">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-lg text-foreground/60">
                    {plan.period}
                  </span>
                </div>
                
                <p className="text-foreground/70 mt-2">
                  {plan.description}
                </p>
              </CardHeader>
              
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-cloud-blue flex-shrink-0" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSelectPlan(plan.name)}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-cloud-blue hover:bg-cloud-blue/90 text-white' 
                      : 'bg-transparent border border-cloud-blue text-cloud-blue hover:bg-cloud-blue hover:text-white'
                  }`}
                  size="lg"
                >
                  Escolher {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-foreground/60 mb-4">
            Não encontrou o que procura? Entre em contato conosco para planos personalizados.
          </p>
          <Button variant="outline" size="lg">
            Contatar Vendas
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PlansSection;