import { Router } from 'express'
import { authenticated, isAdmin, canAccessUser } from '../middleware/auth'
import {
  getAllUsers,
  getUserById,
  updateUser,
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

// Get all users (admin only)
router.get('/', authenticated, isAdmin, getAllUsers)

// Get user by ID (admin or the user themselves)
router.get('/:id', authenticated, canAccessUser, validate(userIdSchema), getUserById)

// Update user profile (self or admin)
router.put('/:id', authenticated, canAccessUser, validate(updateUserSchema), updateUser)

// Delete user (admin only)
router.delete('/:id', authenticated, isAdmin, validate(userIdSchema), deleteUser)

export default router
