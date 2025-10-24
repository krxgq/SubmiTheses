import { Router } from 'express';
import { authenticated, canAccessProject, canModifyProject } from '../middleware/auth';
import {
  getProjectGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
} from '../controllers/grades.controller';
import { validate } from '../middleware/validate';
import {
  createGradeSchema,
  updateGradeSchema,
  gradeIdSchema,
  projectIdSchema,
} from '../validation/schemas';

const router = Router();

// Get all grades for a project
router.get('/:id/grades', authenticated, canAccessProject, validate(projectIdSchema), getProjectGrades);

// Get a specific grade
router.get('/:id/grades/:gradeId', authenticated, canAccessProject, validate(gradeIdSchema), getGradeById);

// Create a new grade
router.post('/:id/grades', authenticated, canModifyProject, validate(createGradeSchema), createGrade);

// Update a grade
router.put('/:id/grades/:gradeId', authenticated, canModifyProject, validate(updateGradeSchema), updateGrade);

// Delete a grade
router.delete('/:id/grades/:gradeId', authenticated, canModifyProject, validate(gradeIdSchema), deleteGrade);

export default router;
