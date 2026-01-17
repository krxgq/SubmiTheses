import { Router } from 'express'
import { authenticated } from '../middleware/auth'
import {
  requireAdmin,
  requireProjectAccess,
  requireProjectModify,
  requireProjectDelete,
  requireGradingAccess
} from '../middleware/authorization.middleware'
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  assignStudentToProject,
  getProjectActivities,
  updateProjectStatus,
  triggerAutoLock
} from '../controllers/projects.controller'
import {
  getTeacherScaleSet,
  getMyGrades,
  submitGrades,
  getAllProjectGrades
} from '../controllers/grading.controller'
import { validate } from '../middleware/validate'
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
  addStudentToProjectSchema,
} from '../validation/schemas'

const router = Router()

// Project CRUD routes
router.get('/', authenticated, getAllProjects);

router.post('/', authenticated, validate(createProjectSchema), createProject);

// Auto-lock trigger (admin only) - must be before /:id
router.post('/auto-lock', authenticated, requireAdmin, triggerAutoLock);

// Get project by ID
router.get('/:id', authenticated, requireProjectAccess, validate(projectIdSchema), getProjectById);

// Get project activities
router.get('/:id/activities', authenticated, requireProjectAccess, validate(projectIdSchema), getProjectActivities);

// Student assignment route (replaces old student management routes)
router.put('/:id/student', authenticated, requireProjectModify, validate(addStudentToProjectSchema), assignStudentToProject);

// Status update route (lock/unlock/publish) - must be before /:id PUT
router.put('/:id/status', authenticated, requireProjectAccess, updateProjectStatus);

// Update project - generic PUT /:id must come after specific routes
router.put('/:id', authenticated, requireProjectModify, validate(updateProjectSchema), updateProject);

router.delete('/:id', authenticated, requireProjectDelete, validate(projectIdSchema), deleteProject);

// Grading routes
router.get('/:id/grading/scale-set', authenticated, requireGradingAccess, getTeacherScaleSet);
router.get('/:id/grading/my-grades', authenticated, requireGradingAccess, getMyGrades);
router.post('/:id/grading/submit', authenticated, requireGradingAccess, submitGrades);
router.get('/:id/grading/all', authenticated, requireProjectAccess, getAllProjectGrades);

export default router
