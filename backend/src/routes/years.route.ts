import { Router } from 'express';
import { authenticated, isAdmin } from '../middleware/auth';
import {
  getAllYears,
  getYearById,
  createYear,
  updateYear,
  deleteYear,
} from '../controllers/years.controller';
import { validate } from '../middleware/validate';
import {
  createYearSchema,
  updateYearSchema,
  yearIdSchema,
} from '../validation/schemas';

const router = Router();

// Get all years
router.get('/', authenticated, getAllYears);

// Get a specific year
router.get('/:id', authenticated, validate(yearIdSchema), getYearById);

// Create a new year
router.post('/', authenticated, isAdmin, validate(createYearSchema), createYear);

// Update a year
router.put('/:id', authenticated, isAdmin, validate(updateYearSchema), updateYear);

// Delete a year
router.delete('/:id', authenticated, isAdmin, validate(yearIdSchema), deleteYear);

export default router;
