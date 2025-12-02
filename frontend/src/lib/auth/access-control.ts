import type { UserRole } from "@sumbi/shared-types";
import type { RouteAccessRule } from "./route-config";

/**
 * Validates if a user has access to a route based on their role and ownership.
 *
 * Performs two levels of checks:
 * 1. Role-based: Does the user have one of the required roles?
 * 2. Ownership-based: For self-access routes, does the user own the resource?
 *
 * Special rules:
 * - Admin and teacher roles bypass ownership checks
 * - Students must own the resource for ownership-protected routes
 *
 * @param userRole - Current user's role from JWT token
 * @param routeConfig - Route configuration with access rules
 * @param userId - Current user's ID from JWT token
 * @param pathParams - Dynamic parameters extracted from URL
 * @returns true if user has access, false otherwise
 *
 * @example
 * // Admin accessing user edit page
 * checkRouteAccess('admin', config, 'user-1', { userId: '123' })
 * // Returns: true (admin has permission)
 *
 * @example
 * // Student accessing their own profile
 * checkRouteAccess('student', config, 'user-123', { userId: '123' })
 * // Returns: true (ownership check passes)
 *
 * @example
 * // Student accessing another user's profile
 * checkRouteAccess('student', config, 'user-123', { userId: '456' })
 * // Returns: false (ownership check fails)
 */
export function checkRouteAccess(
  userRole: UserRole | undefined,
  routeConfig: RouteAccessRule,
  userId: string,
  pathParams: Record<string, string>,
): boolean {
  // 1. Check if user has required role
  if (!userRole || !routeConfig.allowedRoles.includes(userRole)) {
    return false;
  }

  // 2. If no ownership check required, access granted based on role
  if (!routeConfig.checkOwnership || !routeConfig.ownershipParam) {
    return true;
  }

  // 3. Perform ownership check
  const resourceUserId = pathParams[routeConfig.ownershipParam];

  // Admin and teacher bypass ownership checks
  // (they can access any user's resources)
  if (userRole === "admin" || userRole === "teacher") {
    return true;
  }

  // Students can only access their own resources
  // Compare resource owner ID from URL with authenticated user ID
  return resourceUserId === userId;
}
