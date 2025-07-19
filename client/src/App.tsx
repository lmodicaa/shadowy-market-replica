import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
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

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      setSession(session);
      setLoading(false);

      // Limpiar URL después de autenticación exitosa
      if (event === 'SIGNED_IN' && session && window.location.hash.includes('access_token=')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mostrar loading mientras se verifica la sesión inicial
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
        <Router>
          <Switch>
            <Route path="/" component={() => <Index session={session} />} />
            <Route path="/profile" component={() => <Profile session={session} />} />
            <Route path="/settings" component={() => <Settings session={session} />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route component={NotFound} />
          </Switch>
        </Router>
        <Footer />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
