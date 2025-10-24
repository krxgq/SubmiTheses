import { Router } from 'express';
import { authenticated, isAdmin } from '../middleware/auth';
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
router.post('/', authenticated, isAdmin, validate(createScaleSchema), createScale);

// Update a scale
router.put('/:id', authenticated, isAdmin, validate(updateScaleSchema), updateScale);

// Delete a scale
router.delete('/:id', authenticated, isAdmin, validate(scaleIdSchema), deleteScale);

export default router;
