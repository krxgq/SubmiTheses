/**
 * Project types - Re-exported from Prisma auto-generated types
 * API-specific request/response types added manually
 */

import type { projects, project_descriptions, project_role } from '@prisma/client';
import type { User } from './user';

// Re-export Prisma's auto-generated types
export type Project = projects;
export type ProjectDescription = project_descriptions;
export type ProjectRole = project_role;

// Schedule entry type for project timeline (JSON field structure)
export interface ProjectScheduleEntry {
  date: string;
  task: string;
  completed?: boolean;
}

// Project specification details (for API requests)
export interface ProjectSpecification {
  topic?: string;
  project_goal?: string;
  specification?: string;
  schedule?: ProjectScheduleEntry[];
  needed_output?: string[];
  grading_criteria?: string[];
  grading_notes?: string;
}

/**
 * Project with populated user relations
 * Used when API returns projects with nested supervisor/opponent/student data
 */
export interface ProjectWithRelations extends projects {
  supervisor?: User;
  opponent?: User;
  student?: User;
  project_description?: project_descriptions;
}

// API request types (not in database, used for API endpoints)
export interface CreateProjectRequest {
  title: string;
  description?: string;
  subject: string;
  supervisor_id: string;
  opponent_id: string;
  student_id?: string;
  main_documentation?: string;
  status?: 'draft' | 'locked' | 'public';
  year_id?: number;
  subject_id?: number;
  project_description?: ProjectSpecification;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  subject?: string;
  supervisor_id?: string;
  opponent_id?: string;
  student_id?: string;
  main_documentation?: string;
  status?: 'draft' | 'locked' | 'public';
  year_id?: number;
  subject_id?: number;
  project_description?: UpdateProjectDescriptionRequest;
}

export interface CreateProjectDescriptionRequest {
  project_id: number;
  topic?: string;
  project_goal?: string;
  specification?: string;
  schedule?: ProjectScheduleEntry[];
  needed_output?: string[];
  grading_criteria?: string[];
  grading_notes?: string;
}

export interface UpdateProjectDescriptionRequest {
  topic?: string;
  project_goal?: string;
  specification?: string;
  schedule?: ProjectScheduleEntry[];
  needed_output?: string[];
  grading_criteria?: string[];
  grading_notes?: string;
}
