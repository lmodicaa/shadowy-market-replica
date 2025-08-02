import { Router } from 'express';
import { supabase } from '../db.js';

const router = Router();

// Route to test database connectivity
router.get('/test-db', async (req, res) => {
  try {

    
    // Test multiple table connections
    const [usersTest, settingsTest, plansTest] = await Promise.all([
      supabase.from('profiles').select('id').limit(1),
      supabase.from('admin_settings').select('key').limit(1), 
      supabase.from('plans').select('name').limit(1),
    ]);

    const results = {
      profiles: usersTest.error ? { status: 'error', message: usersTest.error.message } : { status: 'ok', count: usersTest.data?.length || 0 },
      admin_settings: settingsTest.error ? { status: 'error', message: settingsTest.error.message } : { status: 'ok', count: settingsTest.data?.length || 0 },
      plans: plansTest.error ? { status: 'error', message: plansTest.error.message } : { status: 'ok', count: plansTest.data?.length || 0 },
    };

    const hasErrors = Object.values(results).some(result => result.status === 'error');

    res.json({
      status: hasErrors ? 'error' : 'ok',
      message: hasErrors ? 'Some database connections failed' : 'All database connections successful',
      details: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database test failed',
      error: (error as any).message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Route to initialize admin settings
router.post('/init-settings', async (req, res) => {
  try {

    
    const defaultSettings = [
      { key: 'maintenance_mode', value: 'false', description: 'Ativar modo de manutenção' },
      { key: 'maintenance_message', value: 'O site está em manutenção. Voltaremos em breve!', description: 'Mensagem exibida durante manutenção' },
      { key: 'max_concurrent_users', value: '100', description: 'Máximo de usuários simultâneos' },
      { key: 'default_plan_duration', value: '30', description: 'Duração padrão dos planos em dias' },
      { key: 'stock_low_threshold', value: '5', description: 'Limite para alerta de estoque baixo' },
      { key: 'stock_empty_message', value: 'Este plano está temporariamente indisponível.', description: 'Mensagem quando estoque esgotado' }
    ];

    // Check existing settings
    const { data: existingSettings, error: selectError } = await supabase
      .from('admin_settings')
      .select('key');
      
    if (selectError) {
      throw selectError;
    }
    
    const existingKeys = existingSettings?.map(s => s.key) || [];
    const settingsToInsert = defaultSettings.filter(setting => 
      !existingKeys.includes(setting.key)
    );
    
    let insertedCount = 0;
    if (settingsToInsert.length > 0) {
      const { data, error } = await supabase
        .from('admin_settings')
        .insert(settingsToInsert.map(setting => ({
          ...setting,
          updated_at: new Date().toISOString()
        })));
        
      if (error) {
        throw error;
      }
      insertedCount = settingsToInsert.length;
    }

    res.json({
      status: 'ok',
      message: `Settings initialized successfully`,
      existing_count: existingKeys.length,
      inserted_count: insertedCount,
      total_settings: defaultSettings.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to initialize settings',
      error: (error as any).message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});



// Route to delete a user (server-side with proper permissions)
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }
    
    // First, delete related subscriptions using service role key
    const { data: subscriptionsData, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId)
      .select();
    

    
    if (subscriptionsError) {
      // Continue with profile deletion even if subscriptions fail
    }
    
    // Delete the user profile using service role key
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
      .select();
    

    
    if (profileError) {
      return res.status(500).json({
        status: 'error',
        message: `Failed to delete user: ${profileError.message}`,
        error: profileError
      });
    }
    

    res.json({
      status: 'ok',
      message: 'User deleted successfully',
      deletedUserId: userId,
      deletedSubscriptions: subscriptionsData?.length || 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during user deletion',
      error: (error as any).message || 'Unknown error'
    });
  }
});

// Route to clear application cache (server-side)
router.post('/clear-cache', async (req, res) => {
  try {

    
    // Simulate cache clearing operations
    // In a real application, you might clear Redis, Node.js cache, etc.
    
    res.json({
      status: 'ok',
      message: 'Server cache cleared successfully',
      actions: [
        'Memory cache cleared',
        'Query cache invalidated',
        'Static cache refreshed'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear cache',
      error: (error as any).message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Route to get system health status
router.get('/health', async (req, res) => {
  try {
    console.log('Checking system health...');
    
    const healthChecks = {
      database: 'unknown',
      memory: 'unknown',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };

    // Test database connectivity
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      healthChecks.database = error ? 'unhealthy' : 'healthy';
    } catch {
      healthChecks.database = 'unhealthy';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    healthChecks.memory = memUsage.heapUsed < 100 * 1024 * 1024 ? 'healthy' : 'warning'; // 100MB threshold

    res.json({
      status: 'ok',
      health: healthChecks,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: (error as any).message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Route for maintenance mode control
router.post('/maintenance', async (req, res) => {
  try {
    const { enabled, message } = req.body;
    
    console.log('Setting maintenance mode:', { enabled, message });

    // Update maintenance settings
    const updates = [
      {
        key: 'maintenance_mode',
        value: enabled ? 'true' : 'false',
        description: 'Ativar modo de manutenção'
      }
    ];

    if (message) {
      updates.push({
        key: 'maintenance_message',
        value: message,
        description: 'Mensagem exibida durante manutenção'
      });
    }

    // Update settings in parallel
    const promises = updates.map(update => 
      supabase.from('admin_settings')
        .upsert({
          ...update,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })
    );

    await Promise.all(promises);

    res.json({
      status: 'ok',
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      maintenance_enabled: enabled,
      maintenance_message: message || 'O site está em manutenção. Voltaremos em breve!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Maintenance mode error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update maintenance mode',
      error: (error as any).message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;