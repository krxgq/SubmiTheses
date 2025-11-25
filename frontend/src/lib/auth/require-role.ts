import type { UserRole } from "@sumbi/shared-types";

interface AuthResult {
  authorized: boolean;
  role?: UserRole;
}

/**
 * Check if user has required role
 * Returns authorization status instead of redirecting
 * Works in both server and client contexts
 */
export async function checkRole(allowedRoles: UserRole[] = ["admin", "teacher", "student"]): Promise<AuthResult> {
  // Get Supabase client appropriate for context (server vs client)
  // Use getUser() instead of getSession() for secure authentication validation
  let user;
  if (typeof window === 'undefined') {
    // Server-side
    const { createClient } = await import('@/lib/supabase-server');
    const supabase = await createClient();
    const { data: { user: authenticatedUser }, error } = await supabase.auth.getUser();

    if (error || !authenticatedUser) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[Auth] Server - No authenticated user:", error?.message);
      }
      return { authorized: false };
    }
    user = authenticatedUser;
  } else {
    // Client-side
    const { supabase } = await import('@/lib/supabase');
    const { data: { user: authenticatedUser }, error } = await supabase.auth.getUser();

    if (error || !authenticatedUser) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[Auth] Client - No authenticated user:", error?.message);
      }
      return { authorized: false };
    }
    user = authenticatedUser;
  }

  // Get role from JWT app_metadata (no database query needed)
  // Role is synced to app_metadata by our database trigger
  const role = user.app_metadata?.role as UserRole;

  if (process.env.NODE_ENV === 'development') {
    console.log("[Auth] User role:", role);
  }

  // Check if user has required role
  if (!allowedRoles.includes(role)) {
    return { authorized: false, role };
  }

  return { authorized: true, role };
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const result = await checkRole(["admin"]);
  return result.authorized;
}

/**
 * Check if user is teacher or admin
 */
export async function isTeacher(): Promise<boolean> {
  const result = await checkRole(["teacher", "admin"]);
  return result.authorized;
}

/**
 * Check if user is student
 */
export async function isStudent(): Promise<boolean> {
  const result = await checkRole(["student"]);
  return result.authorized;
}
