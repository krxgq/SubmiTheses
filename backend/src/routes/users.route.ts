import { Router } from 'express'
import { authenticated, isAdmin, canAccessUser } from '../middleware/auth'

const router = Router()

router.get('/', authenticated, isAdmin, (req, res) => {
  res.json({ message: 'List all users' })
})

router.get('/:id', authenticated, canAccessUser, (req, res) => {
  res.json({ message: `Get user with ID: ${req.params.id}` })
}) //get user details (admin or the user themself)

router.put('/:id', authenticated, canAccessUser, (req, res) => {
  res.json({ message: `Update user with ID: ${req.params.id}` })
}) //update user profile (self or admin)

router.delete('/:id', authenticated, isAdmin, (req, res) => {
  res.json({ message: `Delete user with ID: ${req.params.id}` })
})

export default router
