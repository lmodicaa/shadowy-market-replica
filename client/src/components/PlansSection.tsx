import { Check, Crown, Zap, Star, Package } from 'lucide-react';
import logoWebp from "@assets/logo.webp";
import logoAvif from "@assets/logo.avif";
import { OptimizedPicture } from './OptimizedPicture';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCreateSubscription } from '@/hooks/useUserProfile';
import { useActivePlan } from '@/hooks/useActivePlan';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Função para obter features baseadas no nome do plano
const getFeaturesByPlanName = (planName: string) => {
  const lowerName = planName.toLowerCase();
  
  if (lowerName.includes('básico') || lowerName.includes('basic')) {
    return [
      '4 GB RAM',
      '2 vCPUs',
      '50 GB Armazenamento',
      '10 horas/mês',
      'Suporte por email',
      'Resolução até 1080p'
    ];
  } else if (lowerName.includes('gamer') || lowerName.includes('intermedi')) {
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
      '250 GB Armazenamento',
      'Horas ilimitadas',
      'Suporte 24/7',
      'Resolução até 4K',
      'GPU RTX dedicada',
      'Streaming integrado'
    ];
  } else {
    // Features genéricas para planos não reconhecidos
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

interface PlansSectionProps {
  session?: any;
  onPlanSelect?: (planName: string) => void;
}

const PlansSection = ({ session, onPlanSelect }: PlansSectionProps) => {
  const createSubscription = useCreateSubscription();
  const { data: activePlan, isLoading: loadingActivePlan } = useActivePlan(session?.user?.id);
  const { toast } = useToast();

  // Buscar planos reais da base de dados com fallback - optimized
  const { data: plans = [], isLoading: loadingPlans, error: plansError } = useQuery({
    queryKey: ['plans'],
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    queryFn: async () => {
      try {
        // Tentar consulta simples primeiro
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('status', 'Online')
          .order('name', { ascending: true });
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        // Se não há dados, retornar planos de exemplo
        if (!data || data.length === 0) {
          console.log('No plans found in database, using fallback');
          return getFallbackPlans();
        }
        
        // Mapear planos para incluir ícones e recursos baseados no nome
        return data.map((plan, index) => ({
          ...plan,
          icon: index === 0 ? Zap : index === 1 ? Star : Crown,
          popular: index === 1, // O segundo plano será popular
          features: [
            `${plan.ram || '4 GB'} RAM`,
            `${plan.cpu || '2 vCPUs'} CPU`,
            `${plan.storage || '50 GB'} Armazenamento`,
            `GPU: ${plan.gpu || 'Integrada'}`,
            `Resolução até ${plan.max_resolution || '1080p'}`,
            'Suporte técnico incluído'
          ],
          period: `/${plan.duration || 30} dias`
        }));
      } catch (error) {
        console.error('Error fetching plans:', error);
        // Retornar planos de exemplo se houver erro
        return getFallbackPlans();
      }
    },
    retry: 1,
  });



  const handleSelectPlan = async (plan: { id: string; name: string; price: string }) => {
    if (!session?.user?.id) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para escolher um plano.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Verificar se estamos em um ambiente com backend disponível
      const checkBackendAvailability = async () => {
        try {
          const testResponse = await fetch('/api/admin/health', { method: 'GET' });
          const responseText = await testResponse.text();
          
          // Se a resposta contém HTML (como página 404 do Netlify), backend não está disponível
          if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
            return false;
          }
          
          return testResponse.ok;
        } catch {
          return false;
        }
      };
      
      const isBackendAvailable = await checkBackendAvailability();
      
      if (!isBackendAvailable) {
        // Se o backend não está disponível, mostrar mensagem informativa
        toast({
          title: "Sistema de pagamentos em desenvolvimento",
          description: "O sistema de pagamentos Pix ainda não está ativo em produção. Entre em contato conosco para mais informações.",
          variant: "default",
        });
        return;
      }
      
      // Gerar ID único para o pedido
      const orderId = `PIX_${plan.name.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Extrair valor numérico do preço (ex: "R$ 29,90" -> "29.90")
      const priceValue = plan.price.replace(/[^\d,]/g, '').replace(',', '.');
      
      console.log('🔗 Criando pedido:', { orderId, planName: plan.name, amount: priceValue });
      
      // Criar pedido Pix para o plano
      const response = await fetch('/api/pix/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: orderId,
          userId: session.user.id,
          planId: plan.id,
          planName: plan.name,
          amount: parseFloat(priceValue),
          description: `Plano ${plan.name} - 30 dias de acesso`
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro da API:', response.status, errorText);
        
        // Se recebemos HTML em vez de JSON, significa que o backend não está disponível
        if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html')) {
          throw new Error('Sistema de pagamentos temporariamente indisponível. Tente novamente mais tarde ou entre em contato conosco.');
        }
        
        throw new Error(`Erro ${response.status}: ${errorText || 'Erro ao criar pedido de pagamento'}`);
      }

      const result = await response.json();

      toast({
        title: "Pedido criado com sucesso!",
        description: `Seu pedido para o plano ${plan.name} foi criado. Acesse seu perfil para ver o código Pix.`,
      });

      // Chamar callback se fornecido
      onPlanSelect?.(plan.name);

    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      
      const errorMessage = error?.message || "Ocorreu um erro ao processar sua solicitação. Tente novamente.";
      
      toast({
        title: "Erro ao criar pedido",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

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

          {/* Active Plan Status */}
          {activePlan && activePlan.planName && (
            <div className="mt-8 p-4 rounded-lg bg-cloud-blue/10 border border-cloud-blue/20 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-cloud-blue" />
                <span className="font-semibold text-cloud-blue">Plano Ativo</span>
              </div>
              <p className="text-lg font-bold">{activePlan.planName}</p>
              <p className="text-sm text-foreground/70">
                Expira em {activePlan.daysRemaining || 0} dias
              </p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loadingPlans ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cloud-blue"></div>
            <span className="ml-3 text-lg">Carregando planos...</span>
          </div>
        ) : (
          <>
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

                {/* Stock Info */}
                {plan.stock !== null && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Package className="w-4 h-4 text-foreground/60" />
                    <span className="text-sm text-foreground/60">
                      {plan.stock > 0 ? `${plan.stock} disponíveis` : 'Esgotado'}
                    </span>
                  </div>
                )}
                
                <p className="text-foreground/70 mt-2">
                  {plan.description}
                </p>
              </CardHeader>
              
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-cloud-blue flex-shrink-0" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSelectPlan({ id: plan.id, name: plan.name, price: plan.price })}
                  disabled={(activePlan?.isActive && activePlan.name === plan.name) || (plan.stock !== null && plan.stock <= 0)}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-cloud-blue hover:bg-cloud-blue/90 text-white' 
                      : 'bg-transparent border border-cloud-blue text-cloud-blue hover:bg-cloud-blue hover:text-white'
                  }`}
                  size="lg"
                >
                  {plan.stock !== null && plan.stock <= 0
                    ? 'Esgotado'
                    : activePlan?.isActive && activePlan.name === plan.name
                      ? 'Plano Ativo'
                      : activePlan?.isActive
                        ? 'Já Possui Plano'
                        : `Comprar com Pix`
                  }
                </Button>
              </CardContent>
            </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PlansSection;