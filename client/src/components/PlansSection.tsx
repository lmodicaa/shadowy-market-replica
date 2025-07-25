import { Check, Crown, Zap, Star, Package } from 'lucide-react';
import logoWebp from "@assets/logo.webp";
import logoAvif from "@assets/logo.avif";
import { OptimizedPicture } from './OptimizedPicture';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

// Função para obter features baseadas no nome do plano
const getFeaturesByPlanName = (planName: string) => {
  const lowerName = planName.toLowerCase();
  
  if (lowerName.includes('nova') || lowerName.includes('basic')) {
    return [
      '4 GB RAM',
      '2 vCPUs',
      '50 GB Armazenamento',
      '10 horas/mês',
      'Suporte por email',
      'Resolução até 1080p'
    ];
  } else if (lowerName.includes('plus') || lowerName.includes('gamer')) {
    return [
      '8 GB RAM',
      '4 vCPUs',
      '100 GB Armazenamento',
      '30 horas/mês',
      'Suporte prioritário',
      'Resolução até 1440p',
      'GPU dedicada'
    ];
  } else if (lowerName.includes('pro') || lowerName.includes('premium')) {
    return [
      '16 GB RAM',
      '8 vCPUs',
      '200 GB Armazenamento',
      'Horas ilimitadas',
      'Suporte 24/7',
      'Resolução até 4K',
      'GPU RTX dedicada',
      'Streaming integrado'
    ];
  } else {
    return [
      'Configuração personalizada',
      'Recursos dedicados',
      'Suporte incluído',
      'Acesso completo à plataforma'
    ];
  }
};

// Função para planos de exemplo como fallback
const getFallbackPlans = () => [
  {
    id: '1',
    name: 'Básico',
    price: 'R$ 29,90',
    description: 'Ideal para uso básico e desenvolvimento',
    ram: '4 GB',
    cpu: '2 vCPUs',
    storage: '50 GB',
    gpu: 'Integrada',
    max_resolution: '1080p',
    duration: 30,
    stock: 10,
    status: 'Online',
    icon: Zap,
    popular: false,
    features: [
      '4 GB RAM',
      '2 vCPUs CPU',
      '50 GB Armazenamento',
      'GPU: Integrada',
      'Resolução até 1080p',
      'Suporte técnico incluído'
    ],
    period: '/30 dias'
  },
  {
    id: '2',
    name: 'Gamer',
    price: 'R$ 59,90',
    description: 'Perfeito para gaming e aplicações médias',
    ram: '8 GB',
    cpu: '4 vCPUs',
    storage: '100 GB',
    gpu: 'GTX 1060',
    max_resolution: '1440p',
    duration: 30,
    stock: 5,
    status: 'Online',
    icon: Star,
    popular: true,
    features: [
      '8 GB RAM',
      '4 vCPUs CPU',
      '100 GB Armazenamento',
      'GPU: GTX 1060',
      'Resolução até 1440p',
      'Suporte técnico incluído'
    ],
    period: '/30 dias'
  },
  {
    id: '3',
    name: 'Pro',
    price: 'R$ 99,90',
    description: 'Máxima performance para profissionais',
    ram: '16 GB',
    cpu: '8 vCPUs',
    storage: '250 GB',
    gpu: 'RTX 3070',
    max_resolution: '4K',
    duration: 30,
    stock: 3,
    status: 'Online',
    icon: Crown,
    popular: false,
    features: [
      '16 GB RAM',
      '8 vCPUs CPU',
      '250 GB Armazenamento',
      'GPU: RTX 3070',
      'Resolução até 4K',
      'Suporte técnico incluído'
    ],
    period: '/30 dias'
  }
];

interface Plan {
  id: string;
  name: string;
  price: string;
  description?: string;
  ram?: string;
  cpu?: string;
  storage?: string;
  gpu?: string;
  max_resolution?: string;
  duration?: number;
  stock?: number;
  status?: string;
  icon: any;
  popular: boolean;
  features: string[];
  period: string;
}

interface PlansSectionProps {
  session?: any;
  onPlanSelect?: (planName: string) => void;
}

const PlansSection = ({ session, onPlanSelect }: PlansSectionProps) => {
  const { toast } = useToast();

  // Buscar planos da nova API backend
  const { data: plans = [], isLoading: loadingPlans } = useQuery<Plan[]>({
    queryKey: ['plans'],
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    queryFn: async () => {
      try {
        console.log('Fetching plans from API...');
        const response = await fetch('/api/plans', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        console.log('Response status:', response.status);
        console.log('Response content-type:', response.headers.get('content-type'));
        
        if (!response.ok) {
          throw new Error(`Failed to fetch plans: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('Response text (first 200 chars):', text.substring(0, 200));
        
        let result;
        try {
          result = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response was not JSON, falling back to sample data');
          return getFallbackPlans();
        }
        
        if (!result.plans) {
          console.warn('No plans in response, using fallback');
          return getFallbackPlans();
        }
        
        console.log('Successfully parsed plans:', result.plans.length);
        
        // Mapear os planos para o formato esperado pelo frontend
        return result.plans.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          description: plan.description,
          ram: plan.ram,
          cpu: plan.cpu,
          storage: plan.storage,
          gpu: plan.gpu,
          max_resolution: plan.max_resolution,
          duration: plan.duration,
          stock: plan.stock,
          status: plan.status,
          icon: plan.name.toLowerCase().includes('nova') ? Zap : 
                plan.name.toLowerCase().includes('plus') ? Star :
                plan.name.toLowerCase().includes('pro') ? Crown : Package,
          popular: plan.name.toLowerCase().includes('plus'),
          features: getFeaturesByPlanName(plan.name),
          period: '/30 dias'
        }));
      } catch (error) {
        console.error('Error fetching plans:', error);
        // Fallback para planos exemplo
        return getFallbackPlans();
      }
    },
    retry: 1,
  });

  const handleSelectPlan = async (plan: { id: string; name: string; price: string }) => {
    console.log('Plano selecionado:', plan);
    
    // Para migração inicial, apenas mostrar notificação
    toast({
      title: "Plano selecionado!",
      description: `Você selecionou o plano ${plan.name}. Sistema de pagamentos será restaurado em breve.`,
      variant: "default",
    });

    // Chamar callback se fornecido
    onPlanSelect?.(plan.name);
  };

  if (loadingPlans) {
    return (
      <section id="planos" className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-300 rounded mb-4"></div>
            <div className="h-6 bg-gray-300 rounded mb-8"></div>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="planos" className="py-20 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <OptimizedPicture 
              src={logoWebp} 
              webpSrc={logoWebp}
              avifSrc={logoAvif}
              alt="MateCloud Logo" 
              className="w-6 h-6"
              width={24}
              height={24}
            />
            <span className="text-lg font-semibold text-foreground/80">MateCloud | Planos</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Escolha seu <span className="text-cloud-blue">Plano</span>
          </h2>
          
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Selecione o plano que melhor se adapta às suas necessidades de gaming. 
            Todos os planos incluem acesso completo à nossa plataforma.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  plan.popular 
                    ? 'border-cloud-blue shadow-lg ring-2 ring-cloud-blue/50' 
                    : 'border-border hover:border-cloud-blue/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -right-12 top-6 rotate-45 bg-cloud-blue text-white text-xs font-bold py-1 px-12">
                    POPULAR
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${plan.popular ? 'bg-cloud-blue/20' : 'bg-muted'}`}>
                      <IconComponent className={`w-8 h-8 ${plan.popular ? 'text-cloud-blue' : 'text-muted-foreground'}`} />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-cloud-blue">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  
                  <p className="text-muted-foreground text-sm">
                    {plan.description}
                  </p>

                  {/* Stock Status */}
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <Badge variant={plan.stock && plan.stock > 0 ? "default" : "destructive"}>
                      {plan.stock && plan.stock > 0 ? `${plan.stock} disponíveis` : 'Esgotado'}
                    </Badge>
                    <Badge variant="outline">
                      {plan.status || 'Online'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-cloud-blue flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleSelectPlan(plan)}
                    disabled={!plan.stock || plan.stock === 0}
                    className={`w-full py-6 text-lg font-semibold transition-all duration-200 ${
                      plan.popular 
                        ? 'bg-cloud-blue hover:bg-cloud-blue/90' 
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                  >
                    {plan.stock && plan.stock > 0 ? 'Selecionar Plano' : 'Indisponível'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Todos os planos incluem suporte técnico e acesso total à plataforma MateCloud.
            <br />
            <span className="text-sm">*Preços em reais brasileiros. Renovação automática.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PlansSection;