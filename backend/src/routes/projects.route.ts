import { Router } from 'express'
import { authenticated } from '../middleware/auth'
import {
  requireAdmin,
  requireProjectAccess,
  requireProjectModify,
  requireProjectDelete,
  requireGradingAccess,
  requireSignupAccess,
  requireSignupsViewAccess
} from '../middleware/authorization.middleware'
import {
  getAllProjects,
  getProjectById,
  getPublicProjects,
  getPublicProjectById,
  createProject,
  updateProject,
  deleteProject,
  assignStudentToProject,
  getProjectActivities,
  updateProjectStatus,
  triggerAutoLock,
  bulkPublishProjects
} from '../controllers/projects.controller'
import {
  getTeacherScaleSet,
  getMyGrades,
  submitGrades,
  getAllProjectGrades
} from '../controllers/grading.controller'
import {
  signupForProject,
  cancelSignup,
  getProjectSignups,
  getSignupStatus
} from '../controllers/project-signups.controller'
import { validate } from '../middleware/validate'
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
  addStudentToProjectSchema,
  bulkPublishSchema,
} from '../validation/schemas'

import {
  getPublicProjectAttachments,
  getPublicAttachmentDownloadUrl
} from '../controllers/attachments.controller'

const router = Router()

// Public routes — no authentication required
router.get('/public', getPublicProjects);
router.get('/public/:id', getPublicProjectById);
// Public attachment routes — only for projects with status 'public'
router.get('/public/:id/attachments', getPublicProjectAttachments);
router.get('/public/:id/attachments/:attachmentId/download-url', getPublicAttachmentDownloadUrl);

// Project CRUD routes (authenticated)
router.get('/', authenticated, getAllProjects);

router.post('/', authenticated, validate(createProjectSchema), createProject);

// Auto-lock trigger (admin only) - must be before /:id
router.post('/auto-lock', authenticated, requireAdmin, triggerAutoLock);

// Bulk publish (admin only) - must be before /:id to avoid param collision
router.put('/bulk-publish', authenticated, requireAdmin, validate(bulkPublishSchema), bulkPublishProjects);

// Student signup routes (interest expression) - must be before /:id
router.post('/:id/signup', authenticated, requireSignupAccess, signupForProject);
router.delete('/:id/signup', authenticated, requireSignupAccess, cancelSignup);
router.get('/:id/signups', authenticated, requireSignupsViewAccess, getProjectSignups);
router.get('/:id/signup/status', authenticated, getSignupStatus);

// Get project by ID
router.get('/:id', authenticated, requireProjectAccess, validate(projectIdSchema), getProjectById);

// Get project activities
router.get('/:id/activities', authenticated, requireProjectAccess, validate(projectIdSchema), getProjectActivities);

// Student assignment route
router.put('/:id/student', authenticated, requireProjectModify, validate(addStudentToProjectSchema), assignStudentToProject);

// Status update route (lock/unlock/publish)
router.put('/:id/status', authenticated, requireProjectAccess, updateProjectStatus);

// Update project
router.put('/:id', authenticated, requireProjectModify, validate(updateProjectSchema), updateProject);

router.delete('/:id', authenticated, requireProjectDelete, validate(projectIdSchema), deleteProject);

// Grading routes
router.get('/:id/grading/scale-set', authenticated, requireGradingAccess, getTeacherScaleSet);
router.get('/:id/grading/my-grades', authenticated, requireGradingAccess, getMyGrades);
router.post('/:id/grading/submit', authenticated, requireGradingAccess, submitGrades);
router.get('/:id/grading/all', authenticated, requireProjectAccess, getAllProjectGrades);

export default router
