"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const reviews_controller_1 = require("../controllers/reviews.controller");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validation/schemas");
const router = (0, express_1.Router)();
// Get all reviews for a project
router.get('/:id/reviews', auth_1.authenticated, auth_1.canAccessProject, (0, validate_1.validate)(schemas_1.projectIdSchema), reviews_controller_1.getProjectReviews);
// Get a specific review
router.get('/:id/reviews/:reviewId', auth_1.authenticated, auth_1.canAccessProject, (0, validate_1.validate)(schemas_1.reviewIdSchema), reviews_controller_1.getReviewById);
// Create a new review (supervisor, opponent, or admin)
router.post('/:id/reviews', auth_1.authenticated, (0, validate_1.validate)(schemas_1.createReviewSchema), reviews_controller_1.createReview);
// Update a review (only the reviewer or admin)
router.put('/:id/reviews/:reviewId', auth_1.authenticated, (0, validate_1.validate)(schemas_1.updateReviewSchema), reviews_controller_1.updateReview);
// Delete a review (admin only)
router.delete('/:id/reviews/:reviewId', auth_1.authenticated, auth_1.isAdmin, (0, validate_1.validate)(schemas_1.reviewIdSchema), reviews_controller_1.deleteReview);
exports.default = router;
