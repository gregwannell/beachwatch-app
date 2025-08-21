import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side client for use in API routes and server components
export function createServerClient() {
  // Use service role key if available, otherwise fallback to anon key
  // Note: Service role key is required for accessing tables with RLS policies
  const key = supabaseServiceKey || supabaseAnonKey
  
  return createClient<Database>(supabaseUrl, key, {
    auth: {
      persistSession: false,
    },
  })
}