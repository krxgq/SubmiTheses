import { Router } from 'express'
import { authenticated } from '../middleware/auth'
import {
  requireAdmin,
  requireUserAccess
} from '../middleware/authorization.middleware'
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

// Get all users (ADMIN ONLY - matches frontend restriction)
router.get('/', authenticated, requireAdmin, getAllUsers)

// Get users by role query parameter (?role=teacher)
router.get('/by-role', authenticated, getUsersByRole)

// Get all teachers
router.get('/teachers', authenticated, getTeachers)

// Get user by ID (admin/teacher or the user themselves)
router.get('/:id', authenticated, requireUserAccess, validate(userIdSchema), getUserById)

// Update user profile (self, admin, or teacher)
router.put('/:id', authenticated, requireUserAccess, validate(updateUserSchema), updateUser)

// Update user role (admin only)
router.patch('/:id/role', authenticated, requireAdmin, validate(userIdSchema), updateUserRole)

// Delete user (admin only)
router.delete('/:id', authenticated, requireAdmin, validate(userIdSchema), deleteUser)

export default router
