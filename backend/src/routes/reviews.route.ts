import { Router } from 'express';
import { authenticated } from '../middleware/auth';
import { requireAdmin, requireAdminOrTeacher } from '../middleware/authorization.middleware';
import {
  getProjectReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviews.controller';
import { validate } from '../middleware/validate';
import {
  createReviewSchema,
  updateReviewSchema,
  reviewIdSchema,
  projectIdSchema,
} from '../validation/schemas';

const router = Router();

// Get all reviews for a project (ADMIN/TEACHER ONLY)
router.get('/:id/reviews', authenticated, requireAdminOrTeacher, validate(projectIdSchema), getProjectReviews);

// Get a specific review (ADMIN/TEACHER ONLY)
router.get('/:id/reviews/:reviewId', authenticated, requireAdminOrTeacher, validate(reviewIdSchema), getReviewById);

// Create a new review (ADMIN/TEACHER ONLY)
router.post('/:id/reviews', authenticated, requireAdminOrTeacher, validate(createReviewSchema), createReview);

// Update a review (ADMIN/TEACHER ONLY)
router.put('/:id/reviews/:reviewId', authenticated, requireAdminOrTeacher, validate(updateReviewSchema), updateReview);

// Delete a review (ADMIN ONLY)
router.delete('/:id/reviews/:reviewId', authenticated, requireAdmin, validate(reviewIdSchema), deleteReview);

export default router;
