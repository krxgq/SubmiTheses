import { prisma } from '../lib/prisma';
import type { CreateReviewRequest, UpdateReviewRequest } from '@sumbi/shared-types';
import { NotificationService } from './notifications.service';

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
    const review = await prisma.reviews.create({
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

    // Notify student and supervisor about new review
    const project = await prisma.projects.findUnique({
      where: { id: Number(data.project_id) },
      select: {
        title: true,
        student_id: true,
        supervisor_id: true,
        opponent_id: true,
      },
    });

    if (project) {
      const reviewerName = review.users.first_name && review.users.last_name
        ? `${review.users.first_name} ${review.users.last_name}`
        : review.users.email;

      // Notify student
      if (project.student_id) {
        await NotificationService.createNotification({
          userId: project.student_id,
          type: 'review_submitted',
          title: 'New review submitted',
          message: `${reviewerName} submitted a review for "${project.title}"`,
          metadata: { project_id: Number(data.project_id), review_id: Number(review.id), projectTitle: project.title, reviewerName },
        });
      }

      // Notify supervisor if opponent submitted review (and vice versa)
      if (data.reviewer_id === project.opponent_id && project.supervisor_id) {
        await NotificationService.createNotification({
          userId: project.supervisor_id,
          type: 'review_submitted',
          title: 'Opponent review submitted',
          message: `Opponent submitted a review for "${project.title}"`,
          metadata: { project_id: Number(data.project_id), review_id: Number(review.id), variant: 'opponent', projectTitle: project.title },
        });
      } else if (data.reviewer_id === project.supervisor_id && project.opponent_id) {
        await NotificationService.createNotification({
          userId: project.opponent_id,
          type: 'review_submitted',
          title: 'Supervisor review submitted',
          message: `Supervisor submitted a review for "${project.title}"`,
          metadata: { project_id: Number(data.project_id), review_id: Number(review.id), variant: 'supervisor', projectTitle: project.title },
        });
      }
    }

    return review;
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
