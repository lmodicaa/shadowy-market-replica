import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          case 'first-input':
            setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              setMetrics(prev => ({ ...prev, cls: (prev.cls || 0) + (entry as any).value }));
            }
            break;
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
            }
            break;
          case 'navigation':
            setMetrics(prev => ({ ...prev, ttfb: (entry as any).responseStart }));
            break;
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint', 'navigation'] });
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }

    // Log performance metrics after page load
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as any;
      if (navigation) {
        console.group('🚀 MateCloud Performance Metrics');
        console.log('LCP (Largest Contentful Paint):', metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'N/A');
        console.log('FID (First Input Delay):', metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A');
        console.log('CLS (Cumulative Layout Shift):', metrics.cls ? metrics.cls.toFixed(4) : 'N/A');
        console.log('FCP (First Contentful Paint):', metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'N/A');
        console.log('TTFB (Time to First Byte):', navigation.responseStart ? `${navigation.responseStart.toFixed(2)}ms` : 'N/A');
        console.log('DOM Load:', navigation.domContentLoadedEventEnd ? `${navigation.domContentLoadedEventEnd.toFixed(2)}ms` : 'N/A');
        console.log('Page Load:', navigation.loadEventEnd ? `${navigation.loadEventEnd.toFixed(2)}ms` : 'N/A');
        console.groupEnd();
      }
    }, 3000);

    return () => observer.disconnect();
  }, [metrics]);

  // Don't render anything in production - this is just for monitoring
  return process.env.NODE_ENV === 'development' ? (
    <div style={{ position: 'fixed', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '8px', fontSize: '12px', borderRadius: '4px', zIndex: 9999 }}>
      <div>LCP: {metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : '---'}</div>
      <div>FID: {metrics.fid ? `${metrics.fid.toFixed(0)}ms` : '---'}</div>
      <div>CLS: {metrics.cls ? metrics.cls.toFixed(3) : '---'}</div>
    </div>
  ) : null;
};