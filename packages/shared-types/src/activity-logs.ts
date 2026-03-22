/**
 * Activity Log types for project activity tracking
 */

import type { activity_logs } from '@prisma/client';
import type { User } from './user';

// Re-export Prisma type
export type ActivityLog = activity_logs;

// Activity action types
export type ActivityActionType =
  | 'project_created'
  | 'status_changed'
  | 'file_uploaded'
  | 'file_deleted'
  | 'student_assigned'
  | 'student_removed'
  | 'student_signup'
  | 'student_unsignup'
  | 'supervisor_assigned'
  | 'supervisor_removed'
  | 'opponent_assigned'
  | 'opponent_removed'
  | 'project_updated';

// Activity log with user relation (for displaying who did the action)
export interface ActivityLogWithUser extends activity_logs {
  users: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>;
}

// Response type for recent activities
export interface RecentActivityResponse {
  activities: ActivityLogWithUser[];
  total: number;
}
