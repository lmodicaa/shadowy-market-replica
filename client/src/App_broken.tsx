import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { useIsAdmin } from "@/hooks/useAdmin";

import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";
import MaintenanceMode from "./components/MaintenanceMode";

const AppContent = ({ session }: { session: any }) => {
  const { data: isAdmin } = useIsAdmin(session?.user?.id);

  return (
    <MaintenanceMode userIsAdmin={isAdmin}>
      <Router>
        <Switch>
          <Route path="/" component={() => <Index session={session} />} />
          <Route path="/profile" component={() => <Profile session={session} />} />
          <Route path="/settings" component={() => <Settings session={session} />} />
          <Route path="/admin" component={() => <Admin session={session} />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route component={NotFound} />
        </Switch>
      </Router>
      <Footer />
    </MaintenanceMode>
  );
};

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        setSession(session);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {

      setSession(session);
      setLoading(false);

      // Limpar URL após autenticação bem-sucedida
      if (event === 'SIGNED_IN' && session && window.location.hash.includes('access_token=')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });

    // Basic performance optimization
    const optimizeApp = () => {
      // Preload critical images
      const preloadImage = (src: string) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = src;
        link.as = 'image';
        document.head.appendChild(link);
      };
      
      preloadImage('/attached_assets/logo.png');
      preloadImage('/favicon.png');
    };
    
    optimizeApp();


      if (target && target.tagName.match(/INPUT|TEXTAREA|SELECT/)) {
        startEditing();
      }
    }, { capture: true, passive: true });

    // Event listeners para detectar guardado
    document.addEventListener('submit', stopEditing, { capture: true, passive: true });
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'BUTTON') {
        const text = target.textContent?.toLowerCase() || '';
        const buttonElement = target as HTMLButtonElement;
        if (text.includes('guardar') || text.includes('salvar') || text.includes('save') || 
            buttonElement.type === 'submit' || target.getAttribute('type') === 'submit') {
          stopEditing();
        }
      }
    }, { capture: true, passive: true });

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('input', startEditing, true);
      document.removeEventListener('change', startEditing, true);
      document.removeEventListener('submit', stopEditing, true);
      
      // Restaurar WebSocket original
      (window as any).WebSocket = originalWebSocket;
      
      // Limpiar indicador
      const indicator = document.getElementById('editing-indicator');
      if (indicator) {
        indicator.remove();
      }
    };
  }, []);

  // Mostrar loading enquanto verifica a sessão inicial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cloud-blue"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent session={session} />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
