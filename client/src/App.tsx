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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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