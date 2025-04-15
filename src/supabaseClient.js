import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("supabaseUrl:", supabaseUrl);
console.log("supabaseAnonKey:", supabaseAnonKey);  // This is okay for testing, but remove it later for security

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
