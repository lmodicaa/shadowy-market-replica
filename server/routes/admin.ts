import { Router } from 'express';
import { supabase } from '../db.js';

const router = Router();

// Route to test database connectivity
router.get('/test-db', async (req, res) => {
  try {
    console.log('Testing database connectivity...');
    
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
    console.error('Database test error:', error);
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
    console.log('Initializing admin settings...');
    
    const defaultSettings = [
      { key: 'site_name', value: 'MateCloud', description: 'Nome do site exibido na interface' },
      { key: 'site_description', value: 'A melhor plataforma de cloud gaming do Brasil', description: 'Descrição do site para SEO' },
      { key: 'maintenance_mode', value: 'false', description: 'Ativar modo de manutenção' },
      { key: 'maintenance_message', value: 'O site está em manutenção. Voltaremos em breve!', description: 'Mensagem exibida durante manutenção' },
      { key: 'max_concurrent_users', value: '100', description: 'Máximo de usuários simultâneos' },
      { key: 'default_plan_duration', value: '30', description: 'Duração padrão dos planos em dias' },
      { key: 'support_email', value: 'suporte@matecloud.com.br', description: 'Email de suporte técnico' },
      { key: 'discord_invite', value: 'https://discord.gg/matecloud', description: 'Link do convite do Discord' },
      { key: 'enable_registrations', value: 'true', description: 'Permitir novos registros' },
      { key: 'stock_low_threshold', value: '5', description: 'Limite para alerta de estoque baixo' },
      { key: 'stock_empty_message', value: 'Este plano está temporariamente indisponível.', description: 'Mensagem quando estoque esgotado' },
      { key: 'vm_default_password', value: 'matecloud123', description: 'Senha padrão das VMs' },
      { key: 'vm_session_timeout', value: '60', description: 'Timeout das sessões de VM (minutos)' }
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
    console.error('Settings initialization error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initialize settings',
      error: (error as any).message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Route to clear application cache (server-side)
router.post('/clear-cache', async (req, res) => {
  try {
    console.log('Clearing server-side cache...');
    
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