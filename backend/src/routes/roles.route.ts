import { Router } from 'express';
import { authenticated, isAdmin } from '../middleware/auth';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from '../controllers/roles.controller';
import { validate } from '../middleware/validate';
import {
  createRoleSchema,
  updateRoleSchema,
  roleIdSchema,
} from '../validation/schemas';

const router = Router();

// Get all roles
router.get('/', authenticated, getAllRoles);

// Get a specific role
router.get('/:id', authenticated, validate(roleIdSchema), getRoleById);

// Create a new role
router.post('/', authenticated, isAdmin, validate(createRoleSchema), createRole);

// Update a role
router.put('/:id', authenticated, isAdmin, validate(updateRoleSchema), updateRole);

// Delete a role
router.delete('/:id', authenticated, isAdmin, validate(roleIdSchema), deleteRole);

export default router;
