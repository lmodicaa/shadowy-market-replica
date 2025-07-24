// API utilities for consistent URL handling across environments
export const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // Production domain - use matecloud.store API
  if (hostname === 'matecloud.store' || hostname.includes('matecloud.store')) {
    return 'https://matecloud.store';
  }
  
  // Replit development - use relative URLs to go through Vite proxy to Express server
  if (hostname.includes('.replit.dev')) {
    return '';
  }
  
  // Local development
  if (hostname === 'localhost') {
    return '';
  }
  
  // Fallback to same origin
  return window.location.origin;
};

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