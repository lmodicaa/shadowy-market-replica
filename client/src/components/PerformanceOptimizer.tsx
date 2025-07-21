import { useEffect } from 'react';

// Component to monitor Web Vitals and optimize performance
export const PerformanceOptimizer = () => {
  useEffect(() => {
    // Web Vitals monitoring
    const observeWebVitals = () => {
      // LCP - Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.log('🚀 LCP:', Math.round(entry.startTime) + 'ms');
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // CLS - Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsScore = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsScore += (entry as any).value;
            }
          }
          if (clsScore > 0) {
            console.log('📐 CLS:', clsScore.toFixed(4));
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      }

      // Custom LCP tracking for MateCloud
      const trackMateCloudLCP = () => {
        const startTime = performance.now();
        const checkForContent = () => {
          const heroSection = document.querySelector('section[class*="min-h-screen"]');
          if (heroSection && heroSection.textContent) {
            const lcpTime = performance.now() - startTime;
            console.log('🚀 MateCloud LCP:', lcpTime.toFixed(2) + 'ms');
          } else {
            requestAnimationFrame(checkForContent);
          }
        };
        requestAnimationFrame(checkForContent);
      };

      setTimeout(trackMateCloudLCP, 100);
    };

    observeWebVitals();
  }, []);

  return null;
};