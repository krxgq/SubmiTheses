import { Router } from 'express';
import { authenticated, isAdmin, canAccessProject } from '../middleware/auth';
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

// Get all reviews for a project
router.get('/:id/reviews', authenticated, canAccessProject, validate(projectIdSchema), getProjectReviews);

// Get a specific review
router.get('/:id/reviews/:reviewId', authenticated, canAccessProject, validate(reviewIdSchema), getReviewById);

// Create a new review (supervisor, opponent, or admin)
router.post('/:id/reviews', authenticated, validate(createReviewSchema), createReview);

// Update a review (only the reviewer or admin)
router.put('/:id/reviews/:reviewId', authenticated, validate(updateReviewSchema), updateReview);

// Delete a review (admin only)
router.delete('/:id/reviews/:reviewId', authenticated, isAdmin, validate(reviewIdSchema), deleteReview);

export default router;
