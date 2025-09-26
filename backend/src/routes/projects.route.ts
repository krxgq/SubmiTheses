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

const router = Router()

// Project CRUD routes
router.get('/', authenticated, getAllProjects);

router.post('/', authenticated, createProject);

router.get('/:id', authenticated, canAccessProject, getProjectById);

router.put('/:id', authenticated, canModifyProject, updateProject);

router.delete('/:id', authenticated, isAdmin, deleteProject);

// Student-Project relationship routes
router.get('/:id/students', authenticated, canAccessProject, getProjectStudents);

router.post('/:id/students', authenticated, canModifyProject, addStudentToProject);

router.delete('/:id/students/:studentId', authenticated, canModifyProject, removeStudentFromProject);

router.put('/:id/students', authenticated, canModifyProject, updateProjectStudents);

// Attachment routes
router.get('/:id/attachments', authenticated, canAccessProject, (req, res) => {
  res.json({ message: `Get attachments for project with ID: ${req.params.id}` })
})

router.post('/:id/attachments', authenticated, canModifyProject, (req, res) => {
  res.json({ message: `Add attachment to project with ID: ${req.params.id}` })
})

router.delete('/:id/attachments/:attachmentId', authenticated, canModifyProject, (req, res) => {
  res.json({ message: `Delete attachment with ID: ${req.params.attachmentId} from project with ID: ${req.params.id}` })
})

router.get('/:id/attachments/:attachmentId', authenticated, canAccessProject, (req, res) => {
  res.json({ message: `Get attachment with ID: ${req.params.attachmentId} from project with ID: ${req.params.id}` })
})

// Review routes
router.get('/:id/reviews', authenticated, canAccessProject, (req, res) => {
  res.json({ message: `Get reviews for project with ID: ${req.params.id}` })
})

router.post('/:id/reviews', authenticated, (req, res) => {
  // TODO: Check if user can review (supervisor, opponent, or admin)
  res.json({ message: `Add review to project with ID: ${req.params.id}` })
})

router.delete('/:id/reviews/:reviewId', authenticated, isAdmin, (req, res) => {
  res.json({ message: `Delete review with ID: ${req.params.reviewId} from project with ID: ${req.params.id}` })
})

router.get('/:id/reviews/:reviewId', authenticated, canAccessProject, (req, res) => {
  res.json({ message: `Get review with ID: ${req.params.reviewId} from project with ID: ${req.params.id}` })
})

export default router
