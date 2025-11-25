import { createClient } from '@/lib/supabase-server';
import type { UserRole } from '@sumbi/shared-types';

/**
 * Fetches the user's role from the public.users table.
 *
 * This function queries the database to get the current user's role.
 * Used in middleware and server components for role-based access control.
 *
 * **Important**: This performs a database query, so it should be used sparingly.
 * Consider caching the result or storing it in session/cookies if performance is critical.
 *
 * @param userId - User ID from Supabase auth
 * @returns User role or undefined if not found
 */
export async function getUserRole(userId: string): Promise<UserRole | undefined> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('[getUserRole] Error fetching role:', error);
      return undefined;
    }

    return data.role as UserRole;
  } catch (error) {
    console.error('[getUserRole] Exception:', error);
    return undefined;
  }
}
