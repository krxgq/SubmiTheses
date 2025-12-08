import { Router } from 'express';
import { SubjectsController } from '../controllers/subjects.controller';
import { validate } from '../middleware/validate';
import { requireRoles } from '../middleware/authorization.middleware';
import {
  createSubjectSchema,
  updateSubjectSchema,
  subjectIdSchema,
} from '../validation/schemas';

const router = Router();

// Public routes - anyone can view active subjects
router.get('/', SubjectsController.getActiveSubjects);
router.get('/:id', validate(subjectIdSchema), SubjectsController.getSubjectById);

// Admin-only routes
router.get(
  '/all/list',
  requireRoles(['admin']),
  SubjectsController.getAllSubjects
);

router.post(
  '/',
  requireRoles(['admin']),
  validate(createSubjectSchema),
  SubjectsController.createSubject
);

router.patch(
  '/:id',
  requireRoles(['admin']),
  validate(updateSubjectSchema),
  SubjectsController.updateSubject
);

router.delete(
  '/:id',
  requireRoles(['admin']),
  validate(subjectIdSchema),
  SubjectsController.deleteSubject
);

router.post(
  '/:id/deactivate',
  requireRoles(['admin']),
  validate(subjectIdSchema),
  SubjectsController.deactivateSubject
);

export default router;
