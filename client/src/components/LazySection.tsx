import { lazy, Suspense, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-32"></div>
    </div>
  </div>
);

export const LazySection = ({ 
  children, 
  fallback = <DefaultFallback />, 
  className = "" 
}: LazySectionProps) => {
  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  );
};

// Lazy loaded components for code splitting
export const LazyFeaturesSection = lazy(() => import('./FeaturesSection').then(m => ({ default: m.default })));
export const LazyPlansSection = lazy(() => import('./PlansSection').then(m => ({ default: m.default })));
export const LazyTutorialsSection = lazy(() => import('./TutorialsSection').then(m => ({ default: m.default })));
export const LazyVMDashboard = lazy(() => import('./VMDashboard').then(m => ({ default: m.default })));
export const LazyAdminPlanManager = lazy(() => import('./AdminPlanManager').then(m => ({ default: m.default })));