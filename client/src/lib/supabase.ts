import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'placeholder-key';


// Create Supabase client with proper fallback handling
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: !!import.meta.env.VITE_SUPABASE_URL,
    autoRefreshToken: !!import.meta.env.VITE_SUPABASE_URL
  }
});

// Export a flag to check if we're using real credentials
export const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY));