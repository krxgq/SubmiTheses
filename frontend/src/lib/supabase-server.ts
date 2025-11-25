import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for Server Components
 * Uses cookies for authentication (read-only)
 * Database types not needed since all data fetching goes through backend REST API
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Server Components are read-only for cookies
          // Cookie setting happens in middleware or Route Handlers
        },
      },
    }
  )
}
