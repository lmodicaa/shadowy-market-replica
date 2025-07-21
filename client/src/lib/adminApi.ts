// Admin API utilities
export class AdminAPI {
  static async testDatabase() {
    try {
      console.log('AdminAPI.testDatabase: Making request to /api/admin/test-db');
      const response = await fetch('/api/admin/test-db', {
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
    const response = await fetch('/api/admin/clear-cache', { method: 'POST' });
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Cache clear failed');
    }
    
    return result;
  }

  static async initializeSettings() {
    const response = await fetch('/api/admin/init-settings', { method: 'POST' });
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Settings initialization failed');
    }
    
    return result;
  }

  static async getSystemHealth() {
    try {
      const [dbTest, cacheStatus] = await Promise.all([
        this.testDatabase().catch(e => ({ status: 'error', error: e.message })),
        fetch('/api/health').then(r => r.json()).catch(() => ({ status: 'unknown' }))
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
}