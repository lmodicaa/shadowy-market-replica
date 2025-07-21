import { lazy } from 'react';

// Lazy load heavy components for better performance
export const LazyPlansSection = lazy(() => import('./PlansSection'));
export const LazyTutorialsSection = lazy(() => import('./TutorialsSection'));
export const LazyVMDashboard = lazy(() => import('./VMDashboard'));
export const LazyAdmin = lazy(() => import('../pages/Admin'));

// Loading component for lazy loaded components
export const ComponentLoader = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cloud-blue"></div>
  </div>
);