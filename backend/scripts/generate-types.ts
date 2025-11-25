/**
 * Auto-generate @sumbi/shared-types from Prisma schema
 *
 * This script extracts public schema models from Prisma and generates TypeScript types
 * for the API contract layer used by both frontend and backend.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Models we want to export (only public schema, not auth)
const PUBLIC_MODELS = [
  'public_users',
  'projects',
  'attachments',
  'external_links',
  'grades',
  'reviews',
  'years',
  'scales',
  'scale_sets',
  'scale_set_scales'
];

// Enums to export
const PUBLIC_ENUMS = [
  'user_roles',
  'status',
  'project_role'
];

// Field mappings (Prisma field → API field)
const FIELD_MAPPINGS: Record<string, Record<string, string>> = {
  public_users: {
    // Map verbose Prisma relation names to clean API names
    'projects_projects_student_idTousers': 'student_projects',
    'projects_projects_supervisor_idTousers': 'supervisor_projects',
    'projects_projects_opponent_idTousers': 'opponent_projects',
  }
};

function generateUserTypes(): string {
  return `/**
 * User types - auto-generated from Prisma schema
 */

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  full_name: string | null;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  year_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithYear extends User {
  year?: Year;
}

export interface Year {
  id: number;
  school_id: number | null;
  assignment_date: string | null;
  submission_date: string | null;
  feedback_date: string | null;
  created_at: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  role?: UserRole;
  avatar_url?: string;
  year_id?: number;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}
`;
}

function generateProjectTypes(): string {
  return `/**
 * Project types - auto-generated from Prisma schema
 */

import type { User } from './user';

export type ProjectRole = 'supervisor' | 'opponent';

export interface Project {
  id: number;
  title: string;
  description: string | null;
  subject: string;
  supervisor_id: string;
  opponent_id: string;
  student_id: string | null;
  main_documentation: string | null;
  status: 'draft' | 'submitted' | 'locked' | 'public' | null;
  year_id: number | null;
  updated_at: string;
}

/**
 * Project with populated relations (what the API returns)
 * Used when fetching projects with nested user data
 */
export interface ProjectWithRelations extends Project {
  supervisor?: User;
  opponent?: User;
  student?: User;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  subject: string;
  supervisor_id: string;
  opponent_id: string;
  student_id?: string;
  main_documentation?: string;
  status?: 'draft' | 'submitted' | 'locked' | 'public';
  year_id?: number;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  subject?: string;
  supervisor_id?: string;
  opponent_id?: string;
  student_id?: string;
  main_documentation?: string;
  status?: 'draft' | 'submitted' | 'locked' | 'public';
  year_id?: number;
}
`;
}

async function main() {
  console.log('🔄 Generating shared types from Prisma schema...\n');

  const sharedTypesDir = path.join(__dirname, '../../packages/shared-types/src');

  // Generate user types
  console.log('  ✓ Generating user.ts');
  fs.writeFileSync(
    path.join(sharedTypesDir, 'user.ts'),
    generateUserTypes(),
    'utf-8'
  );

  // Generate project types
  console.log('  ✓ Generating project.ts');
  fs.writeFileSync(
    path.join(sharedTypesDir, 'project.ts'),
    generateProjectTypes(),
    'utf-8'
  );

  console.log('\n✅ Shared types generated successfully!');
  console.log('📁 Location: packages/shared-types/src/\n');
}

main().catch(console.error);
