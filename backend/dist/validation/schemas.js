"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentIdSchema = exports.yearIdSchema = exports.updateYearSchema = exports.createYearSchema = exports.scaleIdSchema = exports.updateScaleSchema = exports.createScaleSchema = exports.roleIdSchema = exports.updateRoleSchema = exports.createRoleSchema = exports.gradeIdSchema = exports.updateGradeSchema = exports.createGradeSchema = exports.externalLinkIdSchema = exports.updateExternalLinkSchema = exports.createExternalLinkSchema = exports.reviewIdSchema = exports.updateReviewSchema = exports.createReviewSchema = exports.updateProjectStudentsSchema = exports.removeStudentFromProjectSchema = exports.addStudentToProjectSchema = exports.projectIdSchema = exports.updateProjectSchema = exports.createProjectSchema = exports.updateUserSchema = void 0;
const zod_1 = require("zod");
// User schemas
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email().optional(),
        raw_user_meta_data: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
        raw_app_meta_data: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    }),
});
// Project schemas
exports.createProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).max(255),
        description: zod_1.z.string().optional(),
        year_id: zod_1.z.coerce.bigint(),
    }),
});
exports.updateProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).max(255).optional(),
        description: zod_1.z.string().optional(),
        year_id: zod_1.z.coerce.bigint().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
    }),
});
exports.projectIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
    }),
});
exports.addStudentToProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        student_id: zod_1.z.string().uuid(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
    }),
});
exports.removeStudentFromProjectSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
        studentId: zod_1.z.string().uuid(),
    }),
});
exports.updateProjectStudentsSchema = zod_1.z.object({
    body: zod_1.z.object({
        student_ids: zod_1.z.array(zod_1.z.string().uuid()),
    }),
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
    }),
});
// Review schemas
exports.createReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        reviewer_id: zod_1.z.string().uuid(),
        comments: zod_1.z.string().min(1),
    }),
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
    }),
});
exports.updateReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        comments: zod_1.z.string().min(1),
    }),
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
        reviewId: zod_1.z.coerce.bigint(),
    }),
});
exports.reviewIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
        reviewId: zod_1.z.coerce.bigint(),
    }),
});
// External Links schemas
exports.createExternalLinkSchema = zod_1.z.object({
    body: zod_1.z.object({
        url: zod_1.z.string().url(),
        title: zod_1.z.string().min(1).max(255),
        description: zod_1.z.string().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
    }),
});
exports.updateExternalLinkSchema = zod_1.z.object({
    body: zod_1.z.object({
        url: zod_1.z.string().url().optional(),
        title: zod_1.z.string().min(1).max(255).optional(),
        description: zod_1.z.string().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
        linkId: zod_1.z.coerce.bigint(),
    }),
});
exports.externalLinkIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
        linkId: zod_1.z.coerce.bigint(),
    }),
});
// Grade schemas
exports.createGradeSchema = zod_1.z.object({
    body: zod_1.z.object({
        reviewer_id: zod_1.z.string().uuid(),
        value: zod_1.z.coerce.bigint(),
        year_id: zod_1.z.coerce.bigint(),
        scale_id: zod_1.z.coerce.bigint().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
    }),
});
exports.updateGradeSchema = zod_1.z.object({
    body: zod_1.z.object({
        value: zod_1.z.coerce.bigint(),
        scale_id: zod_1.z.coerce.bigint().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
        gradeId: zod_1.z.coerce.bigint(),
    }),
});
exports.gradeIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
        gradeId: zod_1.z.coerce.bigint(),
    }),
});
// Role schemas
exports.createRoleSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        description: zod_1.z.string().optional(),
    }),
});
exports.updateRoleSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
    }),
});
exports.roleIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
    }),
});
// Scale schemas
exports.createScaleSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        desc: zod_1.z.string().optional(),
        maxVal: zod_1.z.coerce.bigint(),
    }),
});
exports.updateScaleSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100).optional(),
        desc: zod_1.z.string().optional(),
        maxVal: zod_1.z.coerce.bigint().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
    }),
});
exports.scaleIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
    }),
});
// Year schemas
exports.createYearSchema = zod_1.z.object({
    body: zod_1.z.object({
        assignment_date: zod_1.z.string().datetime().or(zod_1.z.coerce.date()),
        submission_date: zod_1.z.string().datetime().or(zod_1.z.coerce.date()),
        feedback_date: zod_1.z.string().datetime().or(zod_1.z.coerce.date()),
    }),
});
exports.updateYearSchema = zod_1.z.object({
    body: zod_1.z.object({
        assignment_date: zod_1.z.string().datetime().or(zod_1.z.coerce.date()).optional(),
        submission_date: zod_1.z.string().datetime().or(zod_1.z.coerce.date()).optional(),
        feedback_date: zod_1.z.string().datetime().or(zod_1.z.coerce.date()).optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
    }),
});
exports.yearIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
    }),
});
// Attachment schemas
exports.attachmentIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.coerce.bigint(),
        attachmentId: zod_1.z.coerce.bigint(),
    }),
});
