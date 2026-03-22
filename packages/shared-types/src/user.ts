/**
 * User types - Re-exported from Prisma auto-generated types
 * API-specific request/response types added manually
 */

import type { users, years, user_roles } from '@prisma/client';

// Re-export Prisma's auto-generated enum
export type UserRole = user_roles;

// Re-export Prisma's base user type (mapped from users table)
export type User = users;

// Re-export year type
export type Year = years;

// User with year relation (Prisma can generate this, but we define it for clarity)
export interface UserWithYear extends users {
  years?: years | null;
}

// API-specific request types (not in database, used for API endpoints)
export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: user_roles;
  avatar_url?: string;
  year_id?: number;
}

export interface UpdateUserRoleRequest {
  role: user_roles;
}
