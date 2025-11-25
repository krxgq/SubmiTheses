import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client with default cookie storage
// @supabase/ssr automatically handles cookies for browser clients
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)