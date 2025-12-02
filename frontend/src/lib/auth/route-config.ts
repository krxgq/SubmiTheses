import type { UserRole } from "@sumbi/shared-types";

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
 */
export const protectedRoutes: RouteAccessRule[] = [
  // ===== Admin-Only Routes =====
  {
    pattern: "/settings_admin",
    allowedRoles: ["admin"],
  },
  {
    pattern: "/users/:userId/edit",
    allowedRoles: ["admin"],
  },
  {
    pattern: "/users",
    allowedRoles: ["admin"],
  },

  // ===== Teacher or Admin Routes =====

  {
    pattern: "/projects/:projectId/grade",
    allowedRoles: ["admin", "teacher"],
  },
  {
    pattern: "/projects/:projectId/review",
    allowedRoles: ["admin", "teacher"],
  },


  // ===== Authenticated User Routes =====
  {
    pattern: "/projects",
    allowedRoles: ["admin", "teacher", "student"],
  },
  {
    pattern: "/settings",
    allowedRoles: ["admin", "teacher", "student"],
  },

  // ===== Special Routes =====
  {
    pattern: "/access-denied",
    allowedRoles: ["admin", "teacher", "student"],
    // This route is accessible to all authenticated users
    // It's where unauthorized users get rewritten to
    // Without this, we'd have an infinite rewrite loop
  },
];
