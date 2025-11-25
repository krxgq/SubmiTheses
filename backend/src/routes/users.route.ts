import { Router } from 'express'
import { authenticated, isAdmin, canAccessUser } from '../middleware/auth'
import {
  getAllUsers,
  getUserById,
  getUsersByRole,
  getTeachers,
  updateUser,
  updateUserRole,
  deleteUser
} from '../controllers/users.controller'
import { validate } from '../middleware/validate'
import { updateUserSchema } from '../validation/schemas'
import { z } from 'zod'

const router = Router()

const userIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
})

// Get all users (admin/teacher only)
router.get('/', authenticated, getAllUsers)

// Get users by role query parameter (?role=teacher)
router.get('/by-role', authenticated, getUsersByRole)

// Get all teachers
router.get('/teachers', authenticated, getTeachers)

// Get user by ID (admin or the user themselves)
router.get('/:id', authenticated, canAccessUser, validate(userIdSchema), getUserById)

// Update user profile (self or admin)
router.put('/:id', authenticated, canAccessUser, validate(updateUserSchema), updateUser)

// Update user role (admin only)
router.patch('/:id/role', authenticated, isAdmin, validate(userIdSchema), updateUserRole)

// Delete user (admin only)
router.delete('/:id', authenticated, isAdmin, validate(userIdSchema), deleteUser)

export default router
