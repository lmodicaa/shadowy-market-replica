// API utilities for consistent URL handling across environments
export const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // For Replit development, always use relative URLs to go through Vite proxy
  if (hostname.includes('.replit.dev') || hostname === 'localhost') {
    return '';
  }
  
  // For production or other environments, use same origin
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