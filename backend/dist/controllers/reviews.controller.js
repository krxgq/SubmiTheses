"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectReviews = getProjectReviews;
exports.getReviewById = getReviewById;
exports.createReview = createReview;
exports.updateReview = updateReview;
exports.deleteReview = deleteReview;
const reviews_service_1 = require("../services/reviews.service");
async function getProjectReviews(req, res) {
    try {
        const projectId = BigInt(req.params.id);
        const reviews = await reviews_service_1.ReviewService.getReviewsByProjectId(projectId);
        return res.status(200).json(reviews);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
}
async function getReviewById(req, res) {
    try {
        const id = BigInt(req.params.reviewId);
        const review = await reviews_service_1.ReviewService.getReviewById(id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        return res.status(200).json(review);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch review' });
    }
}
async function createReview(req, res) {
    try {
        const projectId = BigInt(req.params.id);
        const reviewerId = req.user.id; // From auth middleware
        const review = await reviews_service_1.ReviewService.createReview({
            project_id: projectId,
            reviewer_id: reviewerId,
            comments: req.body.comments,
        });
        return res.status(201).json(review);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create review' });
    }
}
async function updateReview(req, res) {
    try {
        const id = BigInt(req.params.reviewId);
        const review = await reviews_service_1.ReviewService.updateReview(id, {
            comments: req.body.comments,
        });
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        return res.status(200).json(review);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update review' });
    }
}
async function deleteReview(req, res) {
    try {
        const id = BigInt(req.params.reviewId);
        const deleted = await reviews_service_1.ReviewService.deleteReview(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Review not found' });
        }
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to delete review' });
    }
}
