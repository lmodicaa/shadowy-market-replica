import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration for admin operations');
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: 'User ID is required'
    });
  }

  if (req.method === 'DELETE') {
    try {
      console.log('Deleting user:', userId);
      
      // First, delete related subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId)
        .select();
      
      if (subscriptionsError) {
        console.warn('Warning: Error deleting subscriptions (continuing):', subscriptionsError);
      }
      
      // Delete the user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
        .select();
      
      if (profileError) {
        console.error('Error deleting user profile:', profileError);
        return res.status(500).json({
          status: 'error',
          message: `Failed to delete user: ${profileError.message}`,
          error: profileError
        });
      }
      
      return res.status(200).json({
        status: 'ok',
        message: 'User deleted successfully',
        deletedUserId: userId,
        deletedSubscriptions: subscriptionsData?.length || 0,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error during user deletion:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during user deletion',
        error: (error as any).message || 'Unknown error'
      });
    }
  }

  // Method not allowed for other HTTP methods
  return res.status(405).json({ 
    status: 'error',
    message: 'Method not allowed' 
  });
}