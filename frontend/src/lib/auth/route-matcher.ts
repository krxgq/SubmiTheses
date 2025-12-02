import { protectedRoutes, type RouteAccessRule } from './route-config';

/**
 * Matches a pathname against protected route patterns.
 *
 * Strips the locale prefix and finds the first matching route configuration.
 * Supports dynamic segments like :userId in patterns.
 *
 * @param pathname - Full pathname including locale (e.g., '/en/users/123/edit')
 * @param locale - Current locale (e.g., 'en', 'cz')
 * @returns Matching route config or null if no match
 *
 * @example
 * matchRoute('/en/users/123/edit', 'en')
 * // Returns: { pattern: '/users/:userId/edit', allowedRoles: ['admin'] }
 */

export function matchRoute(
  pathname: string,
  locale: string
): RouteAccessRule | null {
  // Strip locale prefix: /en/users/123 -> /users/123
  const pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '');

  for (const route of protectedRoutes) {
    if (isPatternMatch(pathWithoutLocale, route.pattern)) {
      return route;
    }
  }

  return null;
}

/**
 * Extracts dynamic parameters from a pathname based on a pattern.
 *
 * Matches dynamic segments (prefixed with :) and returns them as key-value pairs.
 *
 * @param pathname - Actual path to extract params from (e.g., '/users/123/edit')
 * @param pattern - Route pattern with dynamic segments (e.g., '/users/:userId/edit')
 * @returns Object with param names as keys and values extracted from pathname
 *
 * @example
 * extractParams('/users/123/edit', '/users/:userId/edit')
 * // Returns: { userId: '123' }
 *
 * extractParams('/projects/abc-123/grade', '/projects/:projectId/grade')
 * // Returns: { projectId: 'abc-123' }
 */
export function extractParams(
  pathname: string,
  pattern: string
): Record<string, string> {
  const params: Record<string, string> = {};

  const pathSegments = pathname.split('/').filter(Boolean);
  const patternSegments = pattern.split('/').filter(Boolean);

  if (pathSegments.length !== patternSegments.length) {
    return params;
  }

  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i];
    const pathSegment = pathSegments[i];

    // Check if this is a dynamic segment (starts with :)
    if (patternSegment.startsWith(':')) {
      const paramName = patternSegment.substring(1); // Remove ':' prefix
      params[paramName] = pathSegment;
    }
  }

  return params;
}

/**
 * Checks if a pathname matches a route pattern.
 *
 * Supports both static and dynamic segments.
 * Dynamic segments are prefixed with : (e.g., :userId)
 *
 * @param pathname - Actual path to check (e.g., '/users/123/edit')
 * @param pattern - Route pattern (e.g., '/users/:userId/edit')
 * @returns true if pathname matches pattern
 *
 * @example
 * isPatternMatch('/users/123/edit', '/users/:userId/edit') // true
 * isPatternMatch('/users/123', '/users/:userId/edit')      // false (different length)
 * isPatternMatch('/settings', '/settings')                 // true (exact match)
 */
function isPatternMatch(pathname: string, pattern: string): boolean {
  const pathSegments = pathname.split('/').filter(Boolean);
  const patternSegments = pattern.split('/').filter(Boolean);

  // Must have same number of segments
  if (pathSegments.length !== patternSegments.length) {
    return false;
  }

  // Check each segment
  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i];
    const pathSegment = pathSegments[i];

    // Dynamic segment (starts with :) matches any value
    if (patternSegment.startsWith(':')) {
      continue;
    }

    // Static segment must match exactly
    if (patternSegment !== pathSegment) {
      return false;
    }
  }

  return true;
}
