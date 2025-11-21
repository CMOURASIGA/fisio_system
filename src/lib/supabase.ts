import { createClient } from '@supabase/supabase-js'
import './vite-env'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // Keep this runtime guard minimal — Vite will inline the env at build time
  console.warn('Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})
