import { z } from 'zod';

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
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    year_id: z.coerce.bigint(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
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
