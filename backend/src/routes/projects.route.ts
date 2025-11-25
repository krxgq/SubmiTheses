import { Router } from 'express'
import { authenticated, isAdmin, canAccessProject, canModifyProject } from '../middleware/auth'
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

router.get('/:id', authenticated, canAccessProject, validate(projectIdSchema), getProjectById);

router.put('/:id', authenticated, canModifyProject, validate(updateProjectSchema), updateProject);

router.delete('/:id', authenticated, isAdmin, validate(projectIdSchema), deleteProject);

// Student assignment route (replaces old student management routes)
router.put('/:id/student', authenticated, canModifyProject, validate(addStudentToProjectSchema), assignStudentToProject);

export default router
