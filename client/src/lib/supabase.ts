import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a more robust client that handles missing environment variables
let supabase: ReturnType<typeof createClient>;

if (supabaseUrl && supabaseKey) {
  console.log('✅ Configurando Supabase com variáveis de ambiente');
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('⚠️ Variáveis de ambiente do Supabase não encontradas. Algumas funcionalidades podem não funcionar.');
  // Create a mock client that won't break the app
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export { supabase };