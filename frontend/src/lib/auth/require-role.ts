import type { UserRole } from "@sumbi/shared-types";
import { validateSession } from './session-validator';

interface AuthResult {
  authorized: boolean;
  userId: string | null;
  role: UserRole | null;
}

/**
 * Check if user has required role
 * Returns authorization status instead of redirecting
 * Uses backend session validation (NO Supabase)
 *
 * @param allowedRoles - Optional array of roles to check. If not provided, just returns current role.
 */
export async function checkRole(allowedRoles?: UserRole[]): Promise<AuthResult> {
  // Validate session using backend API
  const user = await validateSession();

  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      console.log("[Auth] No authenticated session");
    }
    return {
      authorized: false,
      userId: null,
      role: null,
    };
  }

  // Get role from user object
  const role = (user.role as UserRole) || 'student';

  if (process.env.NODE_ENV === 'development') {
    console.log("[Auth] User role from backend:", role);
  }

  // Check authorization if roles specified
  if (allowedRoles && allowedRoles.length > 0) {
    const authorized = allowedRoles.includes(role);
    return {
      authorized,
      userId: user.id,
      role,
    };
  }

  // No roles specified - just return current role
  return {
    authorized: true,
    userId: user.id,
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
