import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl!, supabaseKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
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
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, userId, planId, planName, amount, description } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Verificar si ya existe una orden
    const { data: existingOrder, error: checkError } = await supabase
      .from('pix_orders')
      .select('id')
      .eq('id', id)
      .single();

    if (existingOrder && !checkError) {
      return res.status(409).json({ error: 'Order already exists' });
    }

    // Crear nueva orden
    const { data: newOrder, error: insertError } = await supabase
      .from('pix_orders')
      .insert({
        id,
        user_id: userId,
        plan_id: planId,
        plan_name: planName,
        amount: amount.toString(),
        description,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating Pix order:', insertError);
      return res.status(500).json({ error: 'Failed to create order' });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Pix order created successfully',
      order: newOrder 
    });
  } catch (error) {
    console.error('Error creating Pix order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}