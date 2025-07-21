interface OptimizedPictureProps {
  src: string;
  webpSrc?: string;
  avifSrc?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export function OptimizedPicture({ 
  src, 
  webpSrc,
  avifSrc,
  alt, 
  className = "", 
  width, 
  height, 
  loading = "lazy",
  priority = false 
}: OptimizedPictureProps) {
  // Use provided sources or convert src to base name for multiple formats
  const baseName = src.replace(/\.(png|jpg|jpeg|webp|avif)$/i, '');
  const finalAvifSrc = avifSrc || `${baseName}.avif`;
  const finalWebpSrc = webpSrc || `${baseName}.webp`;
  
  return (
    <picture>
      <source srcSet={finalAvifSrc} type="image/avif" />
      <source srcSet={finalWebpSrc} type="image/webp" />
      <img 
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={priority ? "eager" : loading}
        decoding="async"
      />
    </picture>
  );
}