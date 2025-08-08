import { createClient } from '@supabase/supabase-js'

// Project ID will be auto-injected during deployment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY


export default createClient(supabaseUrl, supabaseAnonKey, { 
  auth: { 
    persistSession: true, 
    autoRefreshToken: true 
  } 
})