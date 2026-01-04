import { prisma } from '../lib/prisma';
import type { CreateReviewRequest, UpdateReviewRequest } from '@sumbi/shared-types';

export class ReviewService {
  static async getReviewsByProjectId(projectId: bigint) {
    return await prisma.reviews.findMany({
      where: { project_id: Number(projectId) },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        submitted_at: 'desc',
      },
    });
  }

  static async getReviewById(id: bigint) {
    return await prisma.reviews.findUnique({
      where: { id: Number(id) },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        projects: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  static async createReview(data: CreateReviewRequest & { project_id: bigint }) {
    return await prisma.reviews.create({
      data: {
        project_id: Number(data.project_id),
        reviewer_id: data.reviewer_id,
        comments: data.comments,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });
  }

  static async updateReview(id: bigint, data: UpdateReviewRequest) {
    return await prisma.reviews.update({
      where: { id: Number(id) },
      data: {
        comments: data.comments,
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });
  }

  static async deleteReview(id: bigint) {
    try {
      const deleted = await prisma.reviews.delete({
        where: { id: Number(id) },
      });
      return !!deleted;
    } catch (error) {
      return false;
    }
  }
}
