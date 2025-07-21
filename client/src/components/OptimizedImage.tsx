import { useState, useCallback, useMemo } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  placeholderColor?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  placeholderColor = '#1e40af20'
}: OptimizedImageProps) => {
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

  // Generate srcSet for different resolutions
  const srcSet = useMemo(() => {
    if (!src.includes('.')) return undefined;
    
    const [name, ext] = src.split('.');
    return [
      `${name}.${ext} 1x`,
      `${name}@2x.${ext} 2x`
    ].join(', ');
  }, [src]);

  const imageStyle = useMemo(() => ({
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    backgroundColor: !isLoaded ? placeholderColor : 'transparent',
    minHeight: height ? `${height}px` : 'auto',
    imageRendering: 'auto',
    transform: 'translateZ(0)', // GPU acceleration
  }), [isLoaded, placeholderColor, height]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {shouldLoad && !hasError && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          srcSet={srcSet}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={imageStyle}
          className="w-full h-full object-contain"
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
        <div 
          className="absolute inset-0 animate-pulse"
          style={{ backgroundColor: placeholderColor }}
        />
      )}
    </div>
  );
};