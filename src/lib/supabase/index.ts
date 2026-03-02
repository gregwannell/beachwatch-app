// Client-side Supabase client (browser)
export { createClient } from './client'

// Server-side Supabase client (SSR/API routes)
export { createServerClient } from './server'

// Default export for compatibility with existing imports
import { createClient } from './client'
export const supabase = createClient()
