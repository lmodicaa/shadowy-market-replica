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
      console.log('Auth state change:', event, session?.user?.email);
      setSession(session);
      setLoading(false);

      // Limpar URL após autenticação bem-sucedida
      if (event === 'SIGNED_IN' && session && window.location.hash.includes('access_token=')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });

    // Sistema robusto para prevenir recargas automáticas cuando editando
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isEditing = sessionStorage.getItem('editing');
      if (isEditing) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar';
        return e.returnValue;
      }
    };

    // Detectar edición en inputs
    const handleInput = () => {
      sessionStorage.setItem('editing', 'true');
    };

    // Detectar guardado
    const handleSave = () => {
      sessionStorage.removeItem('editing');
    };

    // Agregar event listeners para todos los elementos interactivos
    const setupPreventReload = () => {
      // Inputs y formularios
      document.addEventListener('input', handleInput, { capture: true, passive: true });
      document.addEventListener('change', handleInput, { capture: true, passive: true });
      document.addEventListener('submit', handleSave, { capture: true, passive: true });
      
      // Botones de guardar
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target && target.tagName === 'BUTTON') {
          const text = target.textContent?.toLowerCase() || '';
          if (text.includes('guardar') || text.includes('salvar') || text.includes('save') || 
              target.type === 'submit' || target.getAttribute('type') === 'submit') {
            handleSave();
          }
        }
      }, { capture: true, passive: true });

      // Prevenir navegación cuando hay cambios
      window.addEventListener('beforeunload', handleBeforeUnload);
    };

    setupPreventReload();

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('input', handleInput, true);
      document.removeEventListener('change', handleInput, true);
      document.removeEventListener('submit', handleSave, true);
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
