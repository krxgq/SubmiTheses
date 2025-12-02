import { Router } from 'express';
import { authenticated } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorization.middleware';
import {
  getAllScales,
  getScaleById,
  createScale,
  updateScale,
  deleteScale,
} from '../controllers/scales.controller';
import { validate } from '../middleware/validate';
import {
  createScaleSchema,
  updateScaleSchema,
  scaleIdSchema,
} from '../validation/schemas';

const router = Router();

// Get all scales
router.get('/', authenticated, getAllScales);

// Get a specific scale
router.get('/:id', authenticated, validate(scaleIdSchema), getScaleById);

// Create a new scale
router.post('/', authenticated, requireAdmin, validate(createScaleSchema), createScale);

// Update a scale
router.put('/:id', authenticated, requireAdmin, validate(updateScaleSchema), updateScale);

// Delete a scale
router.delete('/:id', authenticated, requireAdmin, validate(scaleIdSchema), deleteScale);

export default router;
