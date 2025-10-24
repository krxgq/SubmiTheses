"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserSchema = exports.CreateUserSchema = exports.UserSchema = exports.UpdateExternalLinkSchema = exports.CreateExternalLinkSchema = exports.ExternalLinkSchema = exports.UpdateAttachmentSchema = exports.CreateAttachmentSchema = exports.AttachmentSchema = exports.UpdateReviewSchema = exports.CreateReviewSchema = exports.ReviewSchema = exports.UpdateProjectSchema = exports.UpdateProjectStudentsSchema = exports.AddStudentToProjectSchema = exports.CreateProjectSchema = exports.ProjectSchema = exports.CreateProjectStudentSchema = exports.ProjectStudentSchema = exports.UpdateSchoolUserSchema = exports.CreateSchoolUserSchema = exports.SchoolUserSchema = exports.UpdateSchoolSchema = exports.CreateSchoolSchema = exports.SchoolSchema = exports.UpdateUserRoleSchema = exports.CreateUserRoleSchema = exports.UserRoleSchema = exports.StatusSchema = void 0;
const zod_1 = require("zod");
// Status enum schema
exports.StatusSchema = zod_1.z.enum(['draft', 'submitted', 'locked', 'public']);
// User Role schema
exports.UserRoleSchema = zod_1.z.object({
    id: zod_1.z.bigint(),
    name: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date(),
});
exports.CreateUserRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
});
exports.UpdateUserRoleSchema = exports.CreateUserRoleSchema.partial();
// School schema
exports.SchoolSchema = zod_1.z.object({
    id: zod_1.z.bigint(),
    name: zod_1.z.string(),
    domain: zod_1.z.string(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date(),
});
exports.CreateSchoolSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    domain: zod_1.z.string().min(1),
});
exports.UpdateSchoolSchema = exports.CreateSchoolSchema.partial();
// School User schema
exports.SchoolUserSchema = zod_1.z.object({
    id: zod_1.z.bigint(),
    email: zod_1.z.string().email(),
    first_name: zod_1.z.string().nullable(),
    last_name: zod_1.z.string().nullable(),
    school_id: zod_1.z.bigint(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date(),
    role_id: zod_1.z.bigint(),
});
exports.CreateSchoolUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    first_name: zod_1.z.string().optional(),
    last_name: zod_1.z.string().optional(),
    school_id: zod_1.z.bigint(),
    role_id: zod_1.z.bigint(),
});
exports.UpdateSchoolUserSchema = exports.CreateSchoolUserSchema.partial();
// ProjectStudent schema (junction table)
exports.ProjectStudentSchema = zod_1.z.object({
    id: zod_1.z.bigint(),
    project_id: zod_1.z.bigint(),
    student_id: zod_1.z.bigint(),
    created_at: zod_1.z.date(),
});
exports.CreateProjectStudentSchema = zod_1.z.object({
    project_id: zod_1.z.bigint(),
    student_id: zod_1.z.bigint(),
});
// Project schema
exports.ProjectSchema = zod_1.z.object({
    id: zod_1.z.bigint(),
    title: zod_1.z.string(),
    supervisor_id: zod_1.z.bigint(),
    created_at: zod_1.z.date(),
    opponent_id: zod_1.z.bigint(),
    subject: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    main_document: zod_1.z.string().nullable(),
    locked_until: zod_1.z.date().nullable(),
    updated_at: zod_1.z.date(),
    status: exports.StatusSchema,
});
exports.CreateProjectSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    supervisor_id: zod_1.z.bigint(),
    opponent_id: zod_1.z.bigint(),
    subject: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    main_document: zod_1.z.string().optional(),
    locked_until: zod_1.z.date().optional(),
    status: exports.StatusSchema.optional(),
});
// Schemas for project-student operations
exports.AddStudentToProjectSchema = zod_1.z.object({
    studentId: zod_1.z.bigint(),
});
exports.UpdateProjectStudentsSchema = zod_1.z.object({
    studentIds: zod_1.z.array(zod_1.z.bigint()),
});
exports.UpdateProjectSchema = exports.CreateProjectSchema.partial();
// Review schema
exports.ReviewSchema = zod_1.z.object({
    id: zod_1.z.bigint(),
    project_id: zod_1.z.bigint(),
    reviewer_id: zod_1.z.bigint(),
    comments: zod_1.z.string(),
    submitted_at: zod_1.z.date(),
    updated_at: zod_1.z.date(),
});
exports.CreateReviewSchema = zod_1.z.object({
    project_id: zod_1.z.bigint(),
    reviewer_id: zod_1.z.bigint(),
    comments: zod_1.z.string().min(1),
});
exports.UpdateReviewSchema = zod_1.z.object({
    comments: zod_1.z.string().min(1),
});
// Attachment schema
exports.AttachmentSchema = zod_1.z.object({
    id: zod_1.z.bigint(),
    project_id: zod_1.z.bigint().nullable(),
    filename: zod_1.z.string(),
    storage_path: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    uploaded_at: zod_1.z.date(),
    updated_at: zod_1.z.date(),
});
exports.CreateAttachmentSchema = zod_1.z.object({
    project_id: zod_1.z.bigint().optional(),
    filename: zod_1.z.string().min(1),
    storage_path: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
});
exports.UpdateAttachmentSchema = zod_1.z.object({
    filename: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
});
// External Link schema
exports.ExternalLinkSchema = zod_1.z.object({
    id: zod_1.z.bigint(),
    project_id: zod_1.z.bigint().nullable(),
    url: zod_1.z.string().nullable(),
    title: zod_1.z.string().nullable(),
    description: zod_1.z.string().nullable(),
    added_at: zod_1.z.date(),
    updated_at: zod_1.z.date(),
});
exports.CreateExternalLinkSchema = zod_1.z.object({
    project_id: zod_1.z.bigint().optional(),
    url: zod_1.z.string().url().optional(),
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
exports.UpdateExternalLinkSchema = exports.CreateExternalLinkSchema.partial();
// Users (auth.users) schema
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    created_at: zod_1.z.date(),
    updated_at: zod_1.z.date(),
    role: zod_1.z.string(),
    school_id: zod_1.z.bigint().nullable(),
});
exports.CreateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    role: zod_1.z.string().default('student'),
    school_id: zod_1.z.bigint().optional(),
});
exports.UpdateUserSchema = zod_1.z.object({
    role: zod_1.z.string().optional(),
    school_id: zod_1.z.bigint().optional(),
});
