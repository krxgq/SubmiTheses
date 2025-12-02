import { Router } from 'express';
import { authenticated } from '../middleware/auth';
import { requireAdminOrTeacher } from '../middleware/authorization.middleware';
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

// Get all grades for a project (ADMIN/TEACHER ONLY)
router.get('/:id/grades', authenticated, requireAdminOrTeacher, validate(projectIdSchema), getProjectGrades);

// Get a specific grade (ADMIN/TEACHER ONLY)  
router.get('/:id/grades/:gradeId', authenticated, requireAdminOrTeacher, validate(gradeIdSchema), getGradeById);

// Create a new grade (ADMIN/TEACHER ONLY)
router.post('/:id/grades', authenticated, requireAdminOrTeacher, validate(createGradeSchema), createGrade);

// Update a grade (ADMIN/TEACHER ONLY)
router.put('/:id/grades/:gradeId', authenticated, requireAdminOrTeacher, validate(updateGradeSchema), updateGrade);

// Delete a grade (ADMIN/TEACHER ONLY)
router.delete('/:id/grades/:gradeId', authenticated, requireAdminOrTeacher, validate(gradeIdSchema), deleteGrade);

export default router;
