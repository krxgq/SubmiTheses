  import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

// Admin client with service role for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// JWT secret from Supabase settings
export const JWT_SECRET = process.env.SUPABASE_JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('Missing SUPABASE_JWT_SECRET environment variable')
}
