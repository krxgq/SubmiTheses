import { Router } from 'express';
import { SubjectsController } from '../controllers/subjects.controller';
import { validate } from '../middleware/validate';
import { authenticated } from '../middleware/auth';
import { requireRoles } from '../middleware/authorization.middleware';
import {
  createSubjectSchema,
  updateSubjectSchema,
  subjectIdSchema,
} from '../validation/schemas';
import {
  destructiveActionRateLimiter,
  sensitiveWriteRateLimiter,
  writeRateLimiter,
} from '../middleware/rate-limit';

const router = Router();

// Public routes - anyone can view active subjects
router.get('/', SubjectsController.getActiveSubjects);
router.get('/:id', validate(subjectIdSchema), SubjectsController.getSubjectById);

// Admin-only routes - need authentication first, then authorization
router.get(
  '/all/list',
  authenticated,
  requireRoles(['admin']),
  SubjectsController.getAllSubjects
);

router.post(
  '/',
  authenticated,
  writeRateLimiter,
  requireRoles(['admin']),
  validate(createSubjectSchema),
  SubjectsController.createSubject
);

router.patch(
  '/:id',
  authenticated,
  writeRateLimiter,
  requireRoles(['admin']),
  validate(updateSubjectSchema),
  SubjectsController.updateSubject
);

router.delete(
  '/:id',
  authenticated,
  destructiveActionRateLimiter,
  requireRoles(['admin']),
  validate(subjectIdSchema),
  SubjectsController.deleteSubject
);

router.post(
  '/:id/deactivate',
  authenticated,
  sensitiveWriteRateLimiter,
  requireRoles(['admin']),
  validate(subjectIdSchema),
  SubjectsController.deactivateSubject
);

router.post(
  '/:id/activate',
  authenticated,
  sensitiveWriteRateLimiter,
  requireRoles(['admin']),
  validate(subjectIdSchema),
  SubjectsController.activateSubject
);

export default router;
