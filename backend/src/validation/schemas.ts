import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refresh_token: z.string().min(1, 'Refresh token is required'),
  }),
});

// User schemas
export const updateUserSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
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
        month: z.string(),
        tasks: z.string()
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
    name_cs: z.string().min(1).max(255),
    name_en: z.string().min(1).max(255),
    description: z.string().optional(),
  }),
});

export const updateSubjectSchema = z.object({
  body: z.object({
    name_cs: z.string().min(1).max(255).optional(),
    name_en: z.string().min(1).max(255).optional(),
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
    assignment_date: z.string().datetime().or(z.coerce.date()),
    submission_date: z.string().datetime().or(z.coerce.date()),
    feedback_date: z.string().datetime().or(z.coerce.date()),
  }),
});

export const updateYearSchema = z.object({
  body: z.object({
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
