import { Router } from 'express'
import { authenticated } from '../middleware/auth'
import {
  requireAdmin,
  requireUserAccess
} from '../middleware/authorization.middleware'
import {
  createUser,
  getAllUsers,
  getUserById,
  getUsersByRole,
  getTeachers,
  updateUser,
  updateUserRole,
  deleteUser,
  validateInvitationToken,
  setupPassword,
  resendInvitation
} from '../controllers/users.controller'
import { validate } from '../middleware/validate'
import {
  updateUserSchema,
  setupPasswordSchema,
  validateInvitationTokenSchema,
  resendInvitationSchema
} from '../validation/schemas'
import { z } from 'zod'

const router = Router()

const userIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
})

// ===== PUBLIC ROUTES (No authentication required) =====

// Validate invitation token
router.get('/validate-invitation', validate(validateInvitationTokenSchema), validateInvitationToken)

// Setup password with invitation token
router.post('/setup-password', validate(setupPasswordSchema), setupPassword)

// ===== AUTHENTICATED ROUTES =====

// Create user (admin only)
router.post('/', authenticated, requireAdmin, createUser)

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

// Resend invitation email (admin only)
router.post('/:id/resend-invitation', authenticated, requireAdmin, validate(resendInvitationSchema), resendInvitation)

export default router
