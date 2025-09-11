export function getApiBaseUrl(): string {
  // En producción (Vercel)
  if (window.location.hostname.includes('vercel.app') || 
      window.location.hostname === 'matecloud.store' ||
      window.location.hostname === 'www.matecloud.store') {
    return window.location.origin;
  }
  
  // En Replit
  if (window.location.hostname.includes('replit')) {
    return window.location.origin;
  }
  
  // En desarrollo local
  return '';
}

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  console.log('API Request:', { endpoint, url, method: options.method || 'GET' });
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', { url, status: response.status, error: errorText });
    throw new Error(`API Error: ${response.status} - ${errorText || 'Unknown error'}`);
  }
  
  return response.json();
};