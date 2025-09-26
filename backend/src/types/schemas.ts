import { z } from 'zod';

// Status enum schema
export const StatusSchema = z.enum(['draft', 'submitted', 'locked', 'public']);

// User Role schema
export const UserRoleSchema = z.object({
  id: z.bigint(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateUserRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const UpdateUserRoleSchema = CreateUserRoleSchema.partial();

// School schema
export const SchoolSchema = z.object({
  id: z.bigint(),
  name: z.string(),
  domain: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateSchoolSchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1),
});

export const UpdateSchoolSchema = CreateSchoolSchema.partial();

// School User schema
export const SchoolUserSchema = z.object({
  id: z.bigint(),
  email: z.string().email(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  school_id: z.bigint(),
  created_at: z.date(),
  updated_at: z.date(),
  role_id: z.bigint(),
});

export const CreateSchoolUserSchema = z.object({
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  school_id: z.bigint(),
  role_id: z.bigint(),
});

export const UpdateSchoolUserSchema = CreateSchoolUserSchema.partial();

// ProjectStudent schema (junction table)
export const ProjectStudentSchema = z.object({
  id: z.bigint(),
  project_id: z.bigint(),
  student_id: z.bigint(),
  created_at: z.date(),
});

export const CreateProjectStudentSchema = z.object({
  project_id: z.bigint(),
  student_id: z.bigint(),
});

// Project schema
export const ProjectSchema = z.object({
  id: z.bigint(),
  title: z.string(),
  supervisor_id: z.bigint(),
  created_at: z.date(),
  opponent_id: z.bigint(),
  subject: z.string(),
  description: z.string().nullable(),
  main_document: z.string().nullable(),
  locked_until: z.date().nullable(),
  updated_at: z.date(),
  status: StatusSchema,
});

export const CreateProjectSchema = z.object({
  title: z.string().min(1),
  supervisor_id: z.bigint(),
  opponent_id: z.bigint(),
  subject: z.string().min(1),
  description: z.string().optional(),
  main_document: z.string().optional(),
  locked_until: z.date().optional(),
  status: StatusSchema.optional(),
});

// Schemas for project-student operations
export const AddStudentToProjectSchema = z.object({
  studentId: z.bigint(),
});

export const UpdateProjectStudentsSchema = z.object({
  studentIds: z.array(z.bigint()),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

// Review schema
export const ReviewSchema = z.object({
  id: z.bigint(),
  project_id: z.bigint(),
  reviewer_id: z.bigint(),
  comments: z.string(),
  submitted_at: z.date(),
  updated_at: z.date(),
});

export const CreateReviewSchema = z.object({
  project_id: z.bigint(),
  reviewer_id: z.bigint(),
  comments: z.string().min(1),
});

export const UpdateReviewSchema = z.object({
  comments: z.string().min(1),
});

// Attachment schema
export const AttachmentSchema = z.object({
  id: z.bigint(),
  project_id: z.bigint().nullable(),
  filename: z.string(),
  storage_path: z.string(),
  description: z.string().nullable(),
  uploaded_at: z.date(),
  updated_at: z.date(),
});

export const CreateAttachmentSchema = z.object({
  project_id: z.bigint().optional(),
  filename: z.string().min(1),
  storage_path: z.string().min(1),
  description: z.string().optional(),
});

export const UpdateAttachmentSchema = z.object({
  filename: z.string().min(1).optional(),
  description: z.string().optional(),
});

// External Link schema
export const ExternalLinkSchema = z.object({
  id: z.bigint(),
  project_id: z.bigint().nullable(),
  url: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  added_at: z.date(),
  updated_at: z.date(),
});

export const CreateExternalLinkSchema = z.object({
  project_id: z.bigint().optional(),
  url: z.string().url().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

export const UpdateExternalLinkSchema = CreateExternalLinkSchema.partial();

// Type inference
export type Status = z.infer<typeof StatusSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type CreateUserRole = z.infer<typeof CreateUserRoleSchema>;
export type UpdateUserRole = z.infer<typeof UpdateUserRoleSchema>;

export type School = z.infer<typeof SchoolSchema>;
export type CreateSchool = z.infer<typeof CreateSchoolSchema>;
export type UpdateSchool = z.infer<typeof UpdateSchoolSchema>;

export type SchoolUser = z.infer<typeof SchoolUserSchema>;
export type CreateSchoolUser = z.infer<typeof CreateSchoolUserSchema>;
export type UpdateSchoolUser = z.infer<typeof UpdateSchoolUserSchema>;

export type ProjectStudent = z.infer<typeof ProjectStudentSchema>;
export type CreateProjectStudent = z.infer<typeof CreateProjectStudentSchema>;

export type Project = z.infer<typeof ProjectSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
export type AddStudentToProject = z.infer<typeof AddStudentToProjectSchema>;
export type UpdateProjectStudents = z.infer<typeof UpdateProjectStudentsSchema>;

export type Review = z.infer<typeof ReviewSchema>;
export type CreateReview = z.infer<typeof CreateReviewSchema>;
export type UpdateReview = z.infer<typeof UpdateReviewSchema>;

export type Attachment = z.infer<typeof AttachmentSchema>;
export type CreateAttachment = z.infer<typeof CreateAttachmentSchema>;
export type UpdateAttachment = z.infer<typeof UpdateAttachmentSchema>;

export type ExternalLink = z.infer<typeof ExternalLinkSchema>;
export type CreateExternalLink = z.infer<typeof CreateExternalLinkSchema>;
export type UpdateExternalLink = z.infer<typeof UpdateExternalLinkSchema>;

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// Users (auth.users) schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  created_at: z.date(),
  updated_at: z.date(),
  role: z.string(),
  school_id: z.bigint().nullable(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  role: z.string().default('student'),
  school_id: z.bigint().optional(),
});

export const UpdateUserSchema = z.object({
  role: z.string().optional(),
  school_id: z.bigint().optional(),
});

// Auth user type for middleware
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  school_id?: bigint;
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  user_metadata?: {
    role?: string;
    school_id?: string;
  };
}