import { useState, useCallback, useRef, useEffect } from 'react';

interface OptimizedPictureProps {
  src: string;
  webpSrc?: string;
  avifSrc?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  placeholderColor?: string;
}

export const OptimizedPicture = ({
  src,
  webpSrc,
  avifSrc,
  alt,
  className = '',
  width,
  height,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  placeholderColor = '#1e40af20'
}: OptimizedPictureProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  const shouldLoad = priority || isIntersecting;

  useEffect(() => {
    if (priority) {
      setIsIntersecting(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [priority]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  const imageStyle = {
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    backgroundColor: !isLoaded ? placeholderColor : 'transparent',
    minHeight: height ? `${height}px` : 'auto',
    transform: 'translateZ(0)', // GPU acceleration
  };

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {shouldLoad && !hasError && (
        <picture>
          {avifSrc && <source srcSet={avifSrc} type="image/avif" />}
          {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            style={imageStyle}
            className="w-full h-full object-contain"
          />
        </picture>
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