import { Router } from 'express';
import { authenticated } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorization.middleware';
import {
  getAllYears,
  getCurrentYear,
  getYearById,
  createYear,
  updateYear,
  deleteYear,
  getYearScaleSets,
} from '../controllers/years.controller';
import { validate } from '../middleware/validate';
import {
  createYearSchema,
  updateYearSchema,
  yearIdSchema,
} from '../validation/schemas';
import {
  destructiveActionRateLimiter,
  writeRateLimiter,
} from '../middleware/rate-limit';

const router = Router();

// Get all years
router.get('/', authenticated, getAllYears);

// Get current academic year
router.get('/current', authenticated, getCurrentYear);

// Get scale sets for a specific year (for cloning)
router.get('/:id/scale-sets', authenticated, requireAdmin, validate(yearIdSchema), getYearScaleSets);

// Get a specific year
router.get('/:id', authenticated, validate(yearIdSchema), getYearById);

// Create a new year
router.post('/', authenticated, writeRateLimiter, requireAdmin, validate(createYearSchema), createYear);

// Update a year
router.put('/:id', authenticated, writeRateLimiter, requireAdmin, validate(updateYearSchema), updateYear);

// Delete a year
router.delete('/:id', authenticated, destructiveActionRateLimiter, requireAdmin, validate(yearIdSchema), deleteYear);

export default router;
