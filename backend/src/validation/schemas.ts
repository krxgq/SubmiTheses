import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    remember_me: z.boolean().optional().default(false),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refresh_token: z.string().min(1, 'Refresh token is required'),
  }),
});

// User schemas
export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    first_name: z.string()
      .min(1, 'First name is required')
      .max(100, 'First name must be less than 100 characters')
      .regex(/^[a-zA-Z\s\-\.'\u00C0-\u017F]+$/, 'First name contains invalid characters'),
    last_name: z.string()
      .min(1, 'Last name is required')
      .max(100, 'Last name must be less than 100 characters')
      .regex(/^[a-zA-Z\s\-\.'\u00C0-\u017F]+$/, 'Last name contains invalid characters'),
    role: z.enum(['admin', 'teacher', 'student']).optional(),
    year_id: z.coerce.bigint().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').optional(),
    first_name: z.string()
      .min(1, 'First name must not be empty')
      .max(100, 'First name must be less than 100 characters')
      .regex(/^[a-zA-Z\s\-\.'\u00C0-\u017F]+$/, 'First name contains invalid characters')
      .optional(),
    last_name: z.string()
      .min(1, 'Last name must not be empty')
      .max(100, 'Last name must be less than 100 characters')
      .regex(/^[a-zA-Z\s\-\.'\u00C0-\u017F]+$/, 'Last name contains invalid characters')
      .optional(),
    year_id: z.coerce.bigint().nullable().optional(),
    raw_user_meta_data: z.record(z.string(), z.unknown()).optional(),
    raw_app_meta_data: z.record(z.string(), z.unknown()).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Project schemas
export const createProjectSchema = z.object({
  body: z.object({
    // Basic project fields
    title: z.string().min(1).max(255),
    subject_id: z.coerce.bigint(), // Changed from subject string to subject_id bigint
    description: z.string().optional(),
    supervisor_id: z.string().uuid(),
    opponent_id: z.string().uuid().nullable().optional(), // Make opponent optional
    student_id: z.string().uuid().optional(),
    year_id: z.coerce.bigint(),
    status: z.enum(['draft', 'submitted', 'locked', 'public']).optional(),

    // Nested project description (optional but recommended)
    project_description: z.object({
      topic: z.string().min(1),
      project_goal: z.string().min(10),
      specification: z.string().min(20),
      needed_output: z.array(z.string().min(3)).min(1),
      schedule: z.array(z.object({
        date: z.string(),
        task: z.string(),
        completed: z.boolean().optional()
      })).optional(),
      grading_criteria: z.array(z.string()).optional(),
      grading_notes: z.string().optional(),
    }).optional(),
  }).refine(data => {
    // If opponent is provided, must be different from supervisor
    if (data.opponent_id && data.supervisor_id === data.opponent_id) {
      return false;
    }
    return true;
  }, {
    message: "Supervisor and opponent must be different people"
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    subject_id: z.coerce.bigint().optional(), // Allow updating subject_id
    year_id: z.coerce.bigint().optional(),
  }),
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

export const projectIdSchema = z.object({
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

// Subject schemas
export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
  }),
});

export const updateSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
  }),
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

export const subjectIdSchema = z.object({
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

export const addStudentToProjectSchema = z.object({
  body: z.object({
    student_id: z.string().uuid(),
  }),
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

export const removeStudentFromProjectSchema = z.object({
  params: z.object({
    id: z.coerce.bigint(),
    studentId: z.string().uuid(),
  }),
});

export const updateProjectStudentsSchema = z.object({
  body: z.object({
    student_ids: z.array(z.string().uuid()),
  }),
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

// Review schemas
export const createReviewSchema = z.object({
  body: z.object({
    reviewer_id: z.string().uuid(),
    comments: z.string().min(1),
  }),
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    comments: z.string().min(1),
  }),
  params: z.object({
    id: z.coerce.bigint(),
    reviewId: z.coerce.bigint(),
  }),
});

export const reviewIdSchema = z.object({
  params: z.object({
    id: z.coerce.bigint(),
    reviewId: z.coerce.bigint(),
  }),
});

// External Links schemas
export const createExternalLinkSchema = z.object({
  body: z.object({
    url: z.string().url(),
    title: z.string().min(1).max(255),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

export const updateExternalLinkSchema = z.object({
  body: z.object({
    url: z.string().url().optional(),
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.coerce.bigint(),
    linkId: z.coerce.bigint(),
  }),
});

export const externalLinkIdSchema = z.object({
  params: z.object({
    id: z.coerce.bigint(),
    linkId: z.coerce.bigint(),
  }),
});

// Grade schemas
export const createGradeSchema = z.object({
  body: z.object({
    reviewer_id: z.string().uuid(),
    value: z.coerce.bigint(),
    year_id: z.coerce.bigint(),
    scale_id: z.coerce.bigint().optional(),
  }),
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

export const updateGradeSchema = z.object({
  body: z.object({
    value: z.coerce.bigint(),
    scale_id: z.coerce.bigint().optional(),
  }),
  params: z.object({
    id: z.coerce.bigint(),
    gradeId: z.coerce.bigint(),
  }),
});

export const gradeIdSchema = z.object({
  params: z.object({
    id: z.coerce.bigint(),
    gradeId: z.coerce.bigint(),
  }),
});

// Role schemas
export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

export const roleIdSchema = z.object({
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

// Scale schemas
export const createScaleSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    desc: z.string().optional(),
    maxVal: z.coerce.bigint(),
  }),
});

export const updateScaleSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    desc: z.string().optional(),
    maxVal: z.coerce.bigint().optional(),
  }),
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

export const scaleIdSchema = z.object({
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

// Year schemas
export const createYearSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    assignment_date: z.string().datetime().or(z.coerce.date()),
    submission_date: z.string().datetime().or(z.coerce.date()),
    feedback_date: z.string().datetime().or(z.coerce.date()),
  }),
});

export const updateYearSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    assignment_date: z.string().datetime().or(z.coerce.date()).optional(),
    submission_date: z.string().datetime().or(z.coerce.date()).optional(),
    feedback_date: z.string().datetime().or(z.coerce.date()).optional(),
  }),
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

export const yearIdSchema = z.object({
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

// Attachment schemas
export const attachmentIdSchema = z.object({
  params: z.object({
    id: z.coerce.bigint(),
    attachmentId: z.coerce.bigint(),
  }),
});

export const uploadAttachmentSchema = z.object({
  params: z.object({
    id: z.coerce.bigint(),
  }),
  body: z.object({
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  }),
});

// Scale Set schemas
export const createScaleSetSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    year_id: z.coerce.bigint(),
    project_role: z.enum(['supervisor', 'opponent']),
  }),
});

export const updateScaleSetSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    year_id: z.coerce.bigint().optional(),
    project_role: z.enum(['supervisor', 'opponent']).optional(),
  }),
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

export const scaleSetIdSchema = z.object({
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

export const addScaleToSetSchema = z.object({
  body: z.object({
    scale_id: z.coerce.bigint(),
    weight: z.number().int().min(0).max(100),
    display_order: z.number().int().optional(),
  }),
  params: z.object({
    id: z.coerce.bigint(),
  }),
});

export const removeScaleFromSetSchema = z.object({
  params: z.object({
    id: z.coerce.bigint(),
    scaleId: z.coerce.bigint(),
  }),
});

export const updateScaleInSetSchema = z.object({
  body: z.object({
    weight: z.number().int().min(0).max(100),
    display_order: z.number().int().optional(),
  }),
  params: z.object({
    id: z.coerce.bigint(),
    scaleId: z.coerce.bigint(),
  }),
});

// Bulk clone scale sets to new year
export const bulkCloneScaleSetsSchema = z.object({
  body: z.object({
    yearId: z.coerce.bigint(),
    scaleSetsData: z.array(
      z.object({
        name: z.string().min(1).max(255),
        project_role: z.enum(['supervisor', 'opponent']),
        scales: z.array(
          z.object({
            scale_id: z.coerce.bigint(),
            weight: z.number().int().min(0).max(100),
            display_order: z.number().int().optional(),
          })
        ),
      })
    ),
  }),
});

// Invitation schemas
export const setupPasswordSchema = z.object({
  body: z.object({
    token: z.string().length(64, 'Invalid invitation token'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const validateInvitationTokenSchema = z.object({
  query: z.object({
    token: z.string().length(64, 'Invalid invitation token'),
  }),
});

export const resendInvitationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
});
