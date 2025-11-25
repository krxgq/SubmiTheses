import { prisma } from '../lib/prisma';

export class ReviewService {
  static async getReviewsByProjectId(projectId: bigint) {
    return await prisma.reviews.findMany({
      where: { project_id: Number(projectId) },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            raw_user_meta_data: true,
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
            raw_user_meta_data: true,
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

  static async createReview(data: {
    project_id: bigint;
    reviewer_id: string;
    comments: string;
  }) {
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
            raw_user_meta_data: true,
          },
        },
      },
    });
  }

  static async updateReview(id: bigint, data: { comments: string }) {
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
            raw_user_meta_data: true,
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
