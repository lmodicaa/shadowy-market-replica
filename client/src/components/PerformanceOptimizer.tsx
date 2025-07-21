import { useEffect } from 'react';

export const PerformanceOptimizer = () => {
  useEffect(() => {
    // Basic Web Vitals monitoring
    const measureWebVitals = () => {
      if ('PerformanceObserver' in window) {
        try {
          // Largest Contentful Paint (LCP)
          const lcpObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              console.log('🚀 LCP:', entry.startTime.toFixed(0) + 'ms');
            }
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

          // First Input Delay (FID)
          const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              console.log('⚡ FID:', ((entry as any).processingStart - entry.startTime).toFixed(0) + 'ms');
            }
          });
          fidObserver.observe({ type: 'first-input', buffered: true });

          // Cumulative Layout Shift (CLS)
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            console.log('📐 CLS:', clsValue.toFixed(4));
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch (error) {
          // Silently handle unsupported browsers
        }
      }
    };

    // Preload critical resources
    const preloadCriticalAssets = () => {
      const criticalAssets = [
        { href: '/logo.avif', as: 'image', type: 'image/avif' },
        { href: '/logo.webp', as: 'image', type: 'image/webp' },
        { href: '/matecloud-favicon.avif', as: 'image', type: 'image/avif' }
      ];

      criticalAssets.forEach(({ href, as, type }) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        if (type) link.type = type;
        document.head.appendChild(link);
      });
    };

    // Initialize optimizations
    measureWebVitals();
    preloadCriticalAssets();

    // Log page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as any;
        if (navigation) {
          console.group('🎯 MateCloud Performance Metrics');
          console.log('DOM Load:', navigation.domContentLoadedEventEnd?.toFixed(0) + 'ms');
          console.log('Page Load:', navigation.loadEventEnd?.toFixed(0) + 'ms');
          console.log('TTFB:', navigation.responseStart?.toFixed(0) + 'ms');
          console.groupEnd();
        }
      }, 1000);
    });
  }, []);

  // Don't render anything
  return null;
};