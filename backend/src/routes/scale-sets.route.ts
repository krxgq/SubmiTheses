import { Router } from 'express';
import { ScaleSetsController } from '../controllers/scale-sets.controller';
import { validate } from '../middleware/validate';
import { requireRoles } from '../middleware/authorization.middleware';
import { authenticated } from '../middleware/auth';
import {
  createScaleSetSchema,
  updateScaleSetSchema,
  scaleSetIdSchema,
  addScaleToSetSchema,
  removeScaleFromSetSchema,
  updateScaleInSetSchema,
  bulkCloneScaleSetsSchema,
} from '../validation/schemas';
import {
  bulkOperationRateLimiter,
  destructiveActionRateLimiter,
  sensitiveWriteRateLimiter,
  writeRateLimiter,
} from '../middleware/rate-limit';

const router = Router();

// Authenticated routes - any authenticated user can view
router.get(
  '/',
  authenticated,
  ScaleSetsController.getAllScaleSets
);

router.get(
  '/:id',
  authenticated,
  validate(scaleSetIdSchema),
  ScaleSetsController.getScaleSetById
);

// Admin-only routes - need authentication first, then authorization
router.post(
  '/',
  authenticated,
  writeRateLimiter,
  requireRoles(['admin']),
  validate(createScaleSetSchema),
  ScaleSetsController.createScaleSet
);

// Bulk clone scale sets to new year (admin only)
router.post(
  '/bulk-clone',
  authenticated,
  bulkOperationRateLimiter,
  requireRoles(['admin']),
  validate(bulkCloneScaleSetsSchema),
  ScaleSetsController.bulkCloneScaleSets
);

router.put(
  '/:id',
  authenticated,
  writeRateLimiter,
  requireRoles(['admin']),
  validate(updateScaleSetSchema),
  ScaleSetsController.updateScaleSet
);

router.delete(
  '/:id',
  authenticated,
  destructiveActionRateLimiter,
  requireRoles(['admin']),
  validate(scaleSetIdSchema),
  ScaleSetsController.deleteScaleSet
);

// Scale management within scale set - admin only
router.post(
  '/:id/scales',
  authenticated,
  sensitiveWriteRateLimiter,
  requireRoles(['admin']),
  validate(addScaleToSetSchema),
  ScaleSetsController.addScaleToSet
);

router.delete(
  '/:id/scales/:scaleId',
  authenticated,
  destructiveActionRateLimiter,
  requireRoles(['admin']),
  validate(removeScaleFromSetSchema),
  ScaleSetsController.removeScaleFromSet
);

router.patch(
  '/:id/scales/:scaleId',
  authenticated,
  sensitiveWriteRateLimiter,
  requireRoles(['admin']),
  validate(updateScaleInSetSchema),
  ScaleSetsController.updateScaleInSet
);

export default router;
