// Project types
export type {
  ProjectScheduleEntry,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest
} from './project';

// User types
export type { User, UpdateUserRoleRequest } from './user';

// Year types
export type { CreateYearRequest, UpdateYearRequest } from './years';

// Attachment types
export type { CreateAttachmentRequest, UpdateAttachmentRequest } from './attachments';

// External link types
export type { CreateExternalLinkRequest, UpdateExternalLinkRequest } from './external-links';

// Grade types
export type { CreateGradeRequest, UpdateGradeRequest } from './grades';

// Review types
export type { CreateReviewRequest, UpdateReviewRequest } from './reviews';

// Scale types
export type { CreateScaleRequest, UpdateScaleRequest } from './scales';

// Scale set types
export type {
  CreateScaleSetRequest,
  UpdateScaleSetRequest,
  AddScaleToSetRequest,
  BulkCloneScaleSetsRequest
} from './scale-sets';

// Subject types
export type { CreateSubjectRequest, UpdateSubjectRequest } from './subjects';

// Activity action types - defines all possible activity log action types
export type ActivityActionType =
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'project_assigned'
  | 'project_unassigned'
  | 'project_submitted'
  | 'project_graded'
  | 'project_commented'
  | 'project_locked'
  | 'project_unlocked'
  | 'status_changed'
  | 'student_assigned'
  | 'student_removed'
  | 'student_signup'
  | 'student_unsignup'
  | 'file_uploaded'
  | 'file_deleted'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_loggedin'
  | 'user_loggedout';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface Year {
  id: bigint;
  name: string | null;
  created_at: Date;
  school_id: bigint | null;
  assignment_date: Date | null;
  submission_date: Date | null;
  feedback_date: Date | null;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  year_id?: number;
  class?: string;
}

// Full user object with year relation
export interface UserWithYear {
  id: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  class: string | null;
  created_at: Date;
  email: string;
  email_verified: boolean;
  year_id: bigint | null;
  avatar_url: string | null;
  years: Year | null;
}

export type ProjectStatus = 'draft' | 'locked' | 'public';

// Minimal project type for list views
export interface ProjectLite {
  id: string;
  title: string;
  status: ProjectStatus;
  is_locked: boolean;
  updated_at: Date;
  student?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  supervisor?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

// Full project type with all relations
export interface ProjectWithRelations extends ProjectLite {
  description: string | null;
  main_documentation: string | null;
  subject: string;
  student_id: string | null;
  supervisor_id: string | null;
  opponent_id: string | null;
  year_id: bigint | null;
  subject_id: bigint | null;
  created_at: Date;
  student?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
    class: string | null;
  } | null;
  supervisor?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
    class: string | null;
  } | null;
  opponent?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
    class: string | null;
  } | null;
  year?: Year | null;
  project_description?: any;
  grades: any[];
  attachments: any[];
}

// Activity Log entry with user relation
export interface ActivityLogWithUser {
  id: bigint;
  project_id: bigint;
  user_id: string;
  action_type: string;
  description: string;
  metadata: any;
  created_at: Date;
  users: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface RecentActivityResponse {
  activities: ActivityLogWithUser[];
}

