import { lazy, Suspense } from 'react';

// Lazy load heavy components to reduce initial bundle size
export const LazyAdminPlanManager = lazy(() => import('./AdminPlanManager'));
export const LazyAdmin = lazy(() => import('../pages/Admin'));
export const LazySettings = lazy(() => import('../pages/Settings'));

// Loading component for lazy components
export const ComponentLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cloud-blue"></div>
    </div>
  }>
    {children}
  </Suspense>
);