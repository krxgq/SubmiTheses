// Re-export Prisma types
export type { reviews as Review } from '@prisma/client';

// API Request types
export interface CreateReviewRequest {
  reviewer_id: string;
  comments: string;
}

export interface UpdateReviewRequest {
  comments: string;
}
