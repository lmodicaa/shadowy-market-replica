// Utility functions for API response handling

/**
 * Safely parses a response as JSON, handling cases where the server
 * returns plain text instead of JSON (common with error responses)
 */
export async function safeParseResponse(response: Response): Promise<any> {
  const text = await response.text();
  
  try {
    return JSON.parse(text);
  } catch (parseError) {
    console.warn('Failed to parse response as JSON:', parseError);
    console.warn('Response text:', text.substring(0, 200));
    
    // If response is not ok and we can't parse JSON, throw with the text
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} - ${text}`);
    }
    
    // If response is ok but not JSON, return the text wrapped in an object
    return { message: text, success: true };
  }
}

/**
 * Makes a fetch request with safe JSON parsing
 */
export async function safeFetch(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  const result = await safeParseResponse(response);
  
  if (!response.ok) {
    throw new Error(result.message || `Request failed with status ${response.status}`);
  }
  
  return result;
}

/**
 * Handles API errors consistently across the application
 */
export function handleApiError(error: any): string {
  if (error instanceof Error) {
    // Check for common JSON parsing errors
    if (error.message.includes('Unexpected token') && error.message.includes('not valid JSON')) {
      return 'Erro de comunicação com o servidor. Tente novamente.';
    }
    
    // Check for network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    return error.message;
  }
  
  return 'Erro desconhecido. Tente novamente.';
}