import { Router } from 'express'
import { authenticated, isAdmin, canAccessProject, canModifyProject } from '../middleware/auth'
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStudents,
  addStudentToProject,
  removeStudentFromProject,
  updateProjectStudents
} from '../controllers/projects.controller'
import { validate } from '../middleware/validate'
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
  addStudentToProjectSchema,
  removeStudentFromProjectSchema,
  updateProjectStudentsSchema,
} from '../validation/schemas'

const router = Router()

// Project CRUD routes
router.get('/', authenticated, getAllProjects);

router.post('/', authenticated, validate(createProjectSchema), createProject);

router.get('/:id', authenticated, canAccessProject, validate(projectIdSchema), getProjectById);

router.put('/:id', authenticated, canModifyProject, validate(updateProjectSchema), updateProject);

router.delete('/:id', authenticated, isAdmin, validate(projectIdSchema), deleteProject);

// Student-Project relationship routes
router.get('/:id/students', authenticated, canAccessProject, validate(projectIdSchema), getProjectStudents);

router.post('/:id/students', authenticated, canModifyProject, validate(addStudentToProjectSchema), addStudentToProject);

router.delete('/:id/students/:studentId', authenticated, canModifyProject, validate(removeStudentFromProjectSchema), removeStudentFromProject);

router.put('/:id/students', authenticated, canModifyProject, validate(updateProjectStudentsSchema), updateProjectStudents);

export default router
