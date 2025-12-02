import { Router } from 'express'
import { authenticated } from '../middleware/auth'
import {
  requireAdmin,
  requireProjectAccess,
  requireProjectModify
} from '../middleware/authorization.middleware'
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  assignStudentToProject
} from '../controllers/projects.controller'
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

router.get('/:id', authenticated, requireProjectAccess, validate(projectIdSchema), getProjectById);

router.put('/:id', authenticated, requireProjectModify, validate(updateProjectSchema), updateProject);

router.delete('/:id', authenticated, requireAdmin, validate(projectIdSchema), deleteProject);

// Student assignment route (replaces old student management routes)
router.put('/:id/student', authenticated, requireProjectModify, validate(addStudentToProjectSchema), assignStudentToProject);

export default router
