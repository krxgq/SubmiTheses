import type { UserRole } from "@sumbi/shared-types";
import { createClient } from '@/lib/supabase-server';
import { extractRoleFromToken } from './jwt-utils';

interface AuthResult {
  authorized: boolean;
  userId: string | null;
  role: UserRole | null;
}

/**
 * Check if user has required role
 * Returns authorization status instead of redirecting
 * Extracts role from JWT token (no cookies, no database queries)
 *
 * @param allowedRoles - Optional array of roles to check. If not provided, just returns current role.
 */
export async function checkRole(allowedRoles?: UserRole[]): Promise<AuthResult> {
  // Server-side only - get Supabase client
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    if (process.env.NODE_ENV === 'development') {
      console.log("[Auth] No authenticated session:", error?.message);
    }
    return {
      authorized: false,
      userId: null,
      role: null,
    };
  }

  // Extract role from JWT token (centralized utility)
  const role = extractRoleFromToken(session.access_token);

  if (process.env.NODE_ENV === 'development') {
    console.log("[Auth] User role from JWT:", role);
  }

  // Check authorization if roles specified
  if (allowedRoles && allowedRoles.length > 0) {
    const authorized = allowedRoles.includes(role);
    return {
      authorized,
      userId: session.user.id,
      role,
    };
  }

  // No roles specified - just return current role
  return {
    authorized: true,
    userId: session.user.id,
    role,
  };
}

/**
 * Check if user is admin
 * @returns true if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const result = await checkRole(['admin']);
  return result.authorized;
}

/**
 * Check if user is teacher or admin
 * @returns true if user has teacher or admin role
 */
export async function isTeacher(): Promise<boolean> {
  const result = await checkRole(['teacher', 'admin']);
  return result.authorized;
}

/**
 * Check if user is student
 * @returns true if user has student role
 */
export async function isStudent(): Promise<boolean> {
  const result = await checkRole(['student']);
  return result.authorized;
}
