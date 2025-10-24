import { Request, Response } from 'express';
import { ReviewService } from '../services/reviews.service';

export async function getProjectReviews(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const reviews = await ReviewService.getReviewsByProjectId(projectId);
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

export async function getReviewById(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.reviewId);
    const review = await ReviewService.getReviewById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    return res.status(200).json(review);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch review' });
  }
}

export async function createReview(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const reviewerId = req.user!.id; // From auth middleware

    const review = await ReviewService.createReview({
      project_id: projectId,
      reviewer_id: reviewerId,
      comments: req.body.comments,
    });

    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create review' });
  }
}

export async function updateReview(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.reviewId);

    const review = await ReviewService.updateReview(id, {
      comments: req.body.comments,
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    return res.status(200).json(review);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update review' });
  }
}

export async function deleteReview(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.reviewId);
    const deleted = await ReviewService.deleteReview(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Review not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete review' });
  }
}
