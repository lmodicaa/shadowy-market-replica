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
  const createSubscription = useCreateSubscription();
  const { data: activePlan, isLoading: loadingActivePlan } = useActivePlan(session?.user?.id);
  const { toast } = useToast();

  // Buscar planos reais da base de dados com fallback - optimized
  const { data: plans = [], isLoading: loadingPlans, error: plansError } = useQuery<Plan[]>({
    queryKey: ['plans'],
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    queryFn: async () => {
      try {
        // Detectar ambiente: desenvolvimento vs produção
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname.includes('replit');
        const baseUrl = isDevelopment ? '' : 'https://matecloud.store';
        
        // Primeiro tentar API backend se disponível
        try {
          const response = await fetch(`${baseUrl}/api/plans`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.plans && result.plans.length > 0) {
              console.log('Planos carregados da API backend:', result.plans.length);
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
            }
          }
        } catch (apiError) {
          console.log('API backend não disponível, tentando Supabase...');
        }

        // Fallback para Supabase se API não funcionar
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
          features: getFeaturesByPlanName(plan.name),
          period: `/${plan.duration || 30} dias`
        })) as Plan[];
      } catch (error) {
        console.error('Error fetching plans:', error);
        // Retornar planos de exemplo se houver erro
        return getFallbackPlans();
      }
    },
    retry: 1,
  });

  const handleSelectPlan = async (plan: { id: string; name: string; price: string }) => {
    console.log('🔥 Botão clicado! Plan:', plan);
    console.log('🔥 Session user:', session?.user?.id);
    
    if (!session?.user?.id) {
      console.log('🔥 Sem login, mostrando toast');
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para escolher um plano.",
        variant: "destructive",
      });
      return;
    }

    console.log('🔥 Usuário logado, criando pedido Pix...');
    try {
      // Gerar ID único para o pedido
      const orderId = `PIX_${plan.name.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Extrair valor numérico do preço (ex: "R$ 29,90" -> "29.90")
      const priceValue = plan.price.replace(/[^\d,]/g, '').replace(',', '.');
      
      console.log('🔗 Criando pedido Pix diretamente no Supabase:', { 
        orderId, 
        planName: plan.name, 
        amount: priceValue, 
        userId: session.user.id 
      });

      // Detectar ambiente e ajustar URL
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname.includes('replit');
      
      // Tentar primeiro com API backend se disponível
      try {
        const baseUrl = isDevelopment ? '' : 'https://matecloud.store';
        const response = await fetch(`${baseUrl}/api/pix/manual`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: orderId,
            userId: session.user.id,
            planId: plan.id,
            planName: plan.name,
            amount: priceValue,
            description: `Plano ${plan.name} - 30 dias de acesso`
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Pedido Pix criado via API backend:', result);
          
          toast({
            title: "Pedido criado com sucesso!",
            description: `Seu pedido para o plano ${plan.name} foi criado. Acesse seu perfil para ver o código Pix quando estiver disponível.`,
          });

          onPlanSelect?.(plan.name);
          return;
        }
      } catch (apiError) {
        console.log('API backend falhou, usando Supabase direto...');
      }

      // Fallback para Supabase direto
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.log('🔥 Supabase não configurado, mostrando mensagem de fallback...');
        toast({
          title: "Sistema de pagamentos em desenvolvimento",
          description: "Para adquirir este plano, entre em contato conosco via Discord ou WhatsApp. O sistema automatizado será ativado em breve!",
          variant: "default",
        });
        return;
      }

      // Criar pedido Pix diretamente no Supabase
      const { data: pixOrder, error } = await supabase
        .from('pix_orders')
        .insert({
          id: orderId,
          user_id: session.user.id,
          plan_id: plan.id,
          plan_name: plan.name,
          amount: priceValue,
          description: `Plano ${plan.name} - 30 dias de acesso`,
          status: 'pendiente'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar pedido Pix:', error);
        
        // Se o erro é devido a configuração/conexão, mostrar mensagem amigável
        if (error.message.includes('Failed to fetch') || error.message.includes('network') || error.code === 'PGRST301') {
          toast({
            title: "Sistema de pagamentos temporariamente indisponível",
            description: "Para adquirir este plano, entre em contato conosco via Discord ou WhatsApp.",
            variant: "default",
          });
          return;
        }
        
        throw new Error(`Erro ao criar pedido: ${error.message}`);
      }

      console.log('✅ Pedido Pix criado com sucesso:', pixOrder);

      toast({
        title: "Pedido criado com sucesso!",
        description: `Seu pedido para o plano ${plan.name} foi criado. Acesse seu perfil para ver o código Pix quando estiver disponível.`,
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

          {/* Active Plan Status */}
          {activePlan && activePlan.planName && (
            <div className="mt-8 p-4 rounded-lg bg-cloud-blue/10 border border-cloud-blue/20 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-cloud-blue" />
                <span className="font-semibold text-cloud-blue">Plano Ativo</span>
              </div>
              <p className="text-lg font-bold">{activePlan.planName}</p>
              <p className="text-sm text-foreground/70">
                {activePlan.daysRemaining !== undefined && activePlan.daysRemaining >= 0
                  ? `${activePlan.daysRemaining} dias restantes`
                  : 'Status indefinido'
                }
              </p>
            </div>
          )}
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