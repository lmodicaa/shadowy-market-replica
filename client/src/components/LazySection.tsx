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

// Lazy loaded components for code splitting - optimized for tree shaking
export const LazyFeaturesSection = lazy(() => 
  import('./FeaturesSection').then(module => ({ default: module.default }))
);
export const LazyPlansSection = lazy(() => 
  import('./PlansSection').then(module => ({ default: module.default }))
);
export const LazyTutorialsSection = lazy(() => 
  import('./TutorialsSection').then(module => ({ default: module.default }))
);
export const LazyVMDashboard = lazy(() => 
  import('./VMDashboard').then(module => ({ default: module.default }))
);
export const LazyAdminPlanManager = lazy(() => 
  import('./AdminPlanManager').then(module => ({ default: module.default }))
);