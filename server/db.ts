import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// For server-side database operations, we need the service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL must be set");
}

if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY must be set for server-side database operations");
}

// Create Supabase client for server operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Use Supabase client for database operations - it's simpler and handles auth automatically
export const db = supabase;