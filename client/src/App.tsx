import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { useIsAdmin } from "@/hooks/useAdmin";

const Index = lazy(() => import("./pages/Index"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
import Footer from "./components/Footer";
import MaintenanceMode from "./components/MaintenanceMode";
import { PerformanceOptimizer } from "./components/PerformanceOptimizer";

const AppContent = ({ session }: { session: any }) => {
  const { data: isAdmin } = useIsAdmin(session?.user?.id);

  return (
    <MaintenanceMode userIsAdmin={isAdmin}>
      <PerformanceOptimizer />
      <Router>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-pulse text-blue-400">Carregando...</div></div>}>
          <Switch>
            <Route path="/" component={() => <Index session={session} />} />
            <Route path="/profile" component={() => <Profile session={session} />} />
            <Route path="/settings" component={() => <Settings session={session} />} />
            <Route path="/admin" component={() => <Admin session={session} />} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </Router>
      <Footer />
    </MaintenanceMode>
  );
};

const App = () => {
  console.log('🚀 App component initializing...');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 App useEffect running...');
    
    const getInitialSession = async () => {
      console.log('🚀 Getting initial session...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('🚀 Session data:', session ? 'User logged in' : 'No session', error ? `Error: ${error.message}` : 'No error');
        if (error) {
          console.error('Error getting session:', error);
        }
        setSession(session);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        console.log('🚀 Setting loading to false...');
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, session ? 'User present' : 'No user');
      
      // BLOQUEO TEMPRANO: Verificar si los registros están habilitados ANTES de procesar
      if (event === 'SIGNED_IN' && session) {
        console.log('🔍 Verificando estado de registros para usuario:', session.user.id);
        
        try {
          // Verificar si el usuario ya existe en la base de datos
          const { data: existingUser, error: userError } = await supabase
            .from('profiles')
            .select('id, created_at')
            .eq('id', session.user.id)
            .single();
            
          console.log('👤 Usuario existente encontrado:', existingUser ? 'Sí' : 'No');
          
          // Si NO es un usuario existente, verificar si los registros están habilitados
          if (!existingUser) {
            console.log('🆕 Usuario nuevo detectado, verificando configuración de registros...');
            
            // Consultar configuración de admin usando el API helper
            const AdminAPI = {
              getRegistrationStatus: async () => {
                const baseUrl = window.location.hostname === 'localhost' 
                  ? 'http://localhost:5000' 
                  : '';
                const response = await fetch(`${baseUrl}/api/admin/registration-status`);
                return response.json();
              }
            };
            
            const registrationConfig = await AdminAPI.getRegistrationStatus();
            
            console.log('⚙️ Configuración de registros:', registrationConfig);
            
            if (!registrationConfig.enabled) {
              console.log('🚫 REGISTROS DESHABILITADOS - Bloqueando acceso');
              
              // Cerrar sesión inmediatamente
              await supabase.auth.signOut();
              
              // Mostrar mensaje de bloqueo
              alert('🚫 Registros Bloqueados\n\nLos nuevos registros están temporalmente deshabilitados.\nSi ya tienes una cuenta, intenta nuevamente más tarde.');
              
              // Redirigir a la página principal
              window.location.href = '/';
              return;
            } else {
              console.log('✅ Registros habilitados - Permitiendo acceso');
            }
          } else if (existingUser) {
            console.log('✅ Usuario existente - Acceso permitido');
          }
        } catch (error) {
          console.error('❌ Error verificando estado de registros:', error);
          // En caso de error, permitir acceso para no bloquear usuarios existentes
        }
      }
      
      setSession(session);
      setLoading(false);

      if (event === 'SIGNED_IN' && session && window.location.hash.includes('access_token=')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });

    // Performance optimizations
    const optimizeApp = () => {
      // Basic Web Vitals monitoring - LCP only
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'largest-contentful-paint') {
                console.log('🚀 MateCloud LCP:', entry.startTime.toFixed(2) + 'ms');
              }
            }
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          // Silently handle if not supported
        }
      }
    };
    
    optimizeApp();

    return () => subscription.unsubscribe();
  }, []);

  console.log('🚀 App render - Loading state:', loading);

  if (loading) {
    console.log('🚀 Showing loading spinner...');
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Carregando MateCloud...</p>
        </div>
      </div>
    );
  }

  console.log('🚀 Rendering main app content...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <AppContent session={session} />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;