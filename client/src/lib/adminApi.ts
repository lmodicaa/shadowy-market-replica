// Admin API utilities
export class AdminAPI {
  static async testDatabase() {
    const response = await fetch('/api/admin/test-db');
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Database test failed');
    }
    
    return result;
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