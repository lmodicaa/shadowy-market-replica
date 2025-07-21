import { useState, useCallback } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const LazyImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver({ 
    triggerOnce: true, 
    threshold: 0.1 
  });
  
  const shouldLoad = priority || isIntersecting;

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {shouldLoad && !hasError && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transform: 'translateZ(0)', // GPU acceleration
            imageRendering: 'auto'
          }}
        />
      )}
      
      {hasError && (
        <div 
          className="flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-500 text-sm"
          style={{ minHeight: height ? `${height}px` : '100px' }}
        >
          <span>Imagem não disponível</span>
        </div>
      )}
      
      {!isLoaded && shouldLoad && !hasError && (
        <div className="absolute inset-0 bg-cloud-blue/10 animate-pulse" />
      )}
    </div>
  );
};