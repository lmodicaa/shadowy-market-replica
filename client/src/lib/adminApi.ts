// Admin API utilities - Fixed for proper API routing
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // Production domain
  if (hostname === 'matecloud.store' || hostname.includes('matecloud.store')) {
    return 'https://matecloud.store';
  }
  
  // Replit development domain - use same origin but ensure it goes to Express server
  if (hostname.includes('.replit.dev')) {
    return window.location.origin;
  }
  
  // Local development - must use full URL to bypass Vite middleware
  return window.location.origin;
};

const API_BASE_URL = getApiBaseUrl();

console.log('AdminAPI Environment Check:', {
  hostname: window.location.hostname,
  isDev: import.meta.env.DEV,
  finalApiBaseUrl: API_BASE_URL || 'relative',
  currentOrigin: window.location.origin,
  mode: import.meta.env.MODE
});

export class AdminAPI {
  static async testDatabase() {
    try {
      const url = `${API_BASE_URL}/api/admin/test-db`;
      console.log('AdminAPI.testDatabase: Making request to', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('AdminAPI.testDatabase: Response status:', response.status);
      console.log('AdminAPI.testDatabase: Response headers:', Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      console.log('AdminAPI.testDatabase: Raw response:', text.substring(0, 200));
      
      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('AdminAPI.testDatabase: JSON parse error:', parseError);
        console.error('AdminAPI.testDatabase: Response text:', text);
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        throw new Error(result.message || 'Database test failed');
      }
      
      return result;
    } catch (error) {
      console.error('AdminAPI.testDatabase: Full error:', error);
      throw error;
    }
  }

  static async clearCache() {
    const response = await fetch(`${API_BASE_URL}/api/admin/clear-cache`, { method: 'POST' });
    
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (parseError) {
      console.error('AdminAPI.clearCache: JSON parse error:', parseError);
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${text}`);
      }
      result = { message: text };
    }
    
    if (!response.ok) {
      throw new Error(result.message || 'Cache clear failed');
    }
    
    return result;
  }

  static async initializeSettings() {
    const response = await fetch(`${API_BASE_URL}/api/admin/init-settings`, { method: 'POST' });
    
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (parseError) {
      console.error('AdminAPI.initializeSettings: JSON parse error:', parseError);
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${text}`);
      }
      result = { message: text };
    }
    
    if (!response.ok) {
      throw new Error(result.message || 'Settings initialization failed');
    }
    
    return result;
  }

  static async getSystemHealth() {
    try {
      const [dbTest, cacheStatus] = await Promise.all([
        this.testDatabase().catch(e => ({ status: 'error', error: e.message })),
        fetch(`${API_BASE_URL}/api/admin/health`).then(r => r.json()).catch(() => ({ status: 'unknown' }))
      ]);

      return {
        database: dbTest.status === 'ok' ? 'healthy' : 'unhealthy',
        cache: 'available',
        server: 'running',
        timestamp: new Date().toISOString(),
        details: {
          database: dbTest,
          cache: cacheStatus
        }
      };
    } catch (error) {
      return {
        database: 'unknown',
        cache: 'unknown', 
        server: 'unknown',
        timestamp: new Date().toISOString(),
        error: (error as any).message
      };
    }
  }

  static async toggleMaintenance(enabled: boolean, message?: string) {
    try {
      const url = `${API_BASE_URL}/api/admin/maintenance`;
      console.log('🔧 AdminAPI.toggleMaintenance: Using URL:', url);
      console.log('🔧 AdminAPI.toggleMaintenance: API_BASE_URL:', API_BASE_URL);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          enabled,
          message: message || 'O site está em manutenção. Voltaremos em breve!'
        })
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('AdminAPI.toggleMaintenance: JSON parse error:', parseError);
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} - ${text}`);
        }
        result = { message: text };
      }
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to toggle maintenance mode');
      }
      
      return result;
    } catch (error) {
      console.error('AdminAPI.toggleMaintenance: Error:', error);
      throw error;
    }
  }
}