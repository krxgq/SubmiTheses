import type { UserRole } from '@sumbi/shared-types';

/**
 * Route access rule configuration for role-based access control.
 *
 * Defines which routes require authentication and which roles can access them.
 * Supports dynamic route parameters and ownership checks.
 */
export type RouteAccessRule = {
  /** Route pattern with optional dynamic segments (e.g., '/users/:userId/edit') */
  pattern: string;

  /** Roles that are allowed to access this route */
  allowedRoles: UserRole[];

  /** Whether to check if the user owns the resource (for self-access routes) */
  checkOwnership?: boolean;

  /** Which URL parameter to use for ownership comparison (e.g., 'userId') */
  ownershipParam?: string;
};

/**
 * Centralized configuration of protected routes.
 *
 * Routes are matched in order, so more specific patterns should come first.
 * Middleware uses this configuration to enforce access control before pages load.
 *
 * Pattern syntax:
 * - Static segments: '/settings_admin'
 * - Dynamic segments: '/users/:userId'
 * - Nested paths: '/projects/:projectId/edit'
 */
export const protectedRoutes: RouteAccessRule[] = [
  // ===== Admin-Only Routes =====
  {
    pattern: '/settings_admin',
    allowedRoles: ['admin'],
  },
  {
    pattern: '/users/:userId/edit',
    allowedRoles: ['admin'],
  },

  // ===== Teacher or Admin Routes =====
  {
    pattern: '/reviews',
    allowedRoles: ['admin', 'teacher'],
  },
  {
    pattern: '/grades',
    allowedRoles: ['admin', 'teacher'],
  },
  {
    pattern: '/projects/:projectId/grade',
    allowedRoles: ['admin', 'teacher'],
  },
  {
    pattern: '/projects/:projectId/review',
    allowedRoles: ['admin', 'teacher'],
  },

  // ===== Self-Access Routes (with ownership check) =====
  {
    pattern: '/users/:userId',
    allowedRoles: ['admin', 'teacher', 'student'],
    checkOwnership: true,
    ownershipParam: 'userId',
  },

  // ===== Authenticated User Routes =====
  {
    pattern: '/projects',
    allowedRoles: ['admin', 'teacher', 'student'],
  },
  {
    pattern: '/settings',
    allowedRoles: ['admin', 'teacher', 'student'],
  },
  {
    pattern: '/attachments',
    allowedRoles: ['admin', 'teacher', 'student'],
  },
  {
    pattern: '/links',
    allowedRoles: ['admin', 'teacher', 'student'],
  },
];
