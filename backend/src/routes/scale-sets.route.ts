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
  requireRoles(['admin']),
  validate(createScaleSetSchema),
  ScaleSetsController.createScaleSet
);

// Bulk clone scale sets to new year (admin only)
router.post(
  '/bulk-clone',
  authenticated,
  requireRoles(['admin']),
  validate(bulkCloneScaleSetsSchema),
  ScaleSetsController.bulkCloneScaleSets
);

router.put(
  '/:id',
  authenticated,
  requireRoles(['admin']),
  validate(updateScaleSetSchema),
  ScaleSetsController.updateScaleSet
);

router.delete(
  '/:id',
  authenticated,
  requireRoles(['admin']),
  validate(scaleSetIdSchema),
  ScaleSetsController.deleteScaleSet
);

// Scale management within scale set - admin only
router.post(
  '/:id/scales',
  authenticated,
  requireRoles(['admin']),
  validate(addScaleToSetSchema),
  ScaleSetsController.addScaleToSet
);

router.delete(
  '/:id/scales/:scaleId',
  authenticated,
  requireRoles(['admin']),
  validate(removeScaleFromSetSchema),
  ScaleSetsController.removeScaleFromSet
);

router.patch(
  '/:id/scales/:scaleId',
  authenticated,
  requireRoles(['admin']),
  validate(updateScaleInSetSchema),
  ScaleSetsController.updateScaleInSet
);

export default router;
