import { useEffect } from 'react';


interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export const SEOHead = ({
  title,
  description,
  keywords = "cloud gaming, gaming na nuvem, MateCloud, jogos online, streaming games",
  image = "/favicon.png",
  url = window.location.href
}: SEOHeadProps) => {
  const siteName = 'MateCloud';
  const siteDescription = 'Jogue seus games favoritos na nuvem com MateCloud. Gaming em alta qualidade sem downloads, com acesso multiplataforma e performance profissional.';
  
  const finalTitle = title || `${siteName} - Gaming na Nuvem | Plataforma de Cloud Gaming Premium`;
  const finalDescription = description || siteDescription;
  useEffect(() => {
    // Update document title
    document.title = finalTitle;
    
    // Update or create meta tags
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Standard meta tags
    updateMeta('description', finalDescription);
    updateMeta('keywords', keywords);
    
    // Open Graph tags
    updateMeta('og:title', finalTitle, true);
    updateMeta('og:description', finalDescription, true);
    updateMeta('og:image', image, true);
    updateMeta('og:url', url, true);
    updateMeta('og:type', 'website', true);
    updateMeta('og:site_name', siteName, true);
    updateMeta('og:locale', 'pt_BR', true);
    
    // Twitter tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', finalTitle);
    updateMeta('twitter:description', finalDescription);
    updateMeta('twitter:image', image);
    
  }, [finalTitle, finalDescription, keywords, image, url, siteName]);

  return null;
};