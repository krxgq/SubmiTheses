import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';

export type NotificationType =
  | 'project_assignment'      // Student assigned to project
  | 'teacher_assigned'         // Teacher assigned as supervisor/opponent
  | 'grade_published'          // Grades now available to student
  | 'grades_submitted'         // Teacher submitted grades (notify other teacher)
  | 'review_submitted'         // Review completed
  | 'status_changed'           // Project status updated
  | 'project_locked'           // Project submitted/locked
  | 'project_unlocked'         // Project unlocked for editing
  | 'deadline_reminder'        // Deadline approaching
  | 'signup_received'          // Student signed up for project
  | 'system';                  // System announcements

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilters {
  read?: boolean;
  type?: NotificationType;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * NotificationService - Handles creation, retrieval, and management of user notifications
 * Uses Redis caching for unread counts to minimize database queries
 */
export class NotificationService {
  private static readonly UNREAD_COUNT_CACHE_TTL = 60; // 60 seconds cache for unread counts

  /**
   * Create a new notification for a user
   * Invalidates the user's unread count cache
   */
  static async createNotification(input: CreateNotificationInput): Promise<void> {
    try {
      await prisma.notifications.create({
        data: {
          user_id: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          metadata: input.metadata || undefined,
        },
      });

      // Invalidate unread count cache for this user
      await cache.delete(`notifications:unread:${input.userId}`);
    } catch (error) {
      console.error('[NotificationService] Failed to create notification:', error);
      // Don't throw - notification failures shouldn't break main operations
    }
  }

  /**
   * Create multiple notifications at once (batch operation)
   * Useful for notifying multiple users about the same event
   */
  static async createNotifications(inputs: CreateNotificationInput[]): Promise<void> {
    try {
      await prisma.notifications.createMany({
        data: inputs.map(input => ({
          user_id: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          metadata: input.metadata || undefined,
        })),
      });

      // Invalidate cache for all affected users
      const userIds = [...new Set(inputs.map(i => i.userId))];
      await Promise.all(
        userIds.map(userId => cache.delete(`notifications:unread:${userId}`))
      );
    } catch (error) {
      console.error('[NotificationService] Failed to create notifications:', error);
    }
  }

  /**
   * Get notifications for a user with optional filtering and pagination
   */
  static async getUserNotifications(
    userId: string,
    filters: NotificationFilters = {},
    pagination: PaginationParams = {}
  ) {
    const { limit = 20, offset = 0 } = pagination;

    const where: any = { user_id: userId };

    if (filters.read !== undefined) {
      where.read = filters.read;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    const [notifications, total] = await Promise.all([
      prisma.notifications.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notifications.count({ where }),
    ]);

    return {
      notifications,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Mark a specific notification as read
   * Verifies the notification belongs to the user
   */
  static async markAsRead(notificationId: bigint, userId: string): Promise<boolean> {
    try {
      const result = await prisma.notifications.updateMany({
        where: {
          id: notificationId,
          user_id: userId,
        },
        data: {
          read: true,
        },
      });

      if (result.count > 0) {
        // Invalidate unread count cache
        await cache.delete(`notifications:unread:${userId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[NotificationService] Failed to mark notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await prisma.notifications.updateMany({
        where: {
          user_id: userId,
          read: false,
        },
        data: {
          read: true,
        },
      });

      // Invalidate unread count cache
      await cache.delete(`notifications:unread:${userId}`);

      return result.count;
    } catch (error) {
      console.error('[NotificationService] Failed to mark all as read:', error);
      return 0;
    }
  }

  /**
   * Delete a notification
   * Verifies the notification belongs to the user
   */
  static async deleteNotification(notificationId: bigint, userId: string): Promise<boolean> {
    try {
      const result = await prisma.notifications.deleteMany({
        where: {
          id: notificationId,
          user_id: userId,
        },
      });

      if (result.count > 0) {
        // Invalidate unread count cache
        await cache.delete(`notifications:unread:${userId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[NotificationService] Failed to delete notification:', error);
      return false;
    }
  }

  /**
   * Get count of unread notifications for a user
   * Cached in Redis with 60-second TTL for performance
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const cacheKey = `notifications:unread:${userId}`;

    // Try to get from cache
    const cached = await cache.get<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Query database
    const count = await prisma.notifications.count({
      where: {
        user_id: userId,
        read: false,
      },
    });

    // Cache for 60 seconds
    await cache.set(cacheKey, count, this.UNREAD_COUNT_CACHE_TTL);

    return count;
  }

  /**
   * Delete all notifications for a user (cleanup utility)
   */
  static async deleteAllNotifications(userId: string): Promise<number> {
    try {
      const result = await prisma.notifications.deleteMany({
        where: {
          user_id: userId,
        },
      });

      // Invalidate cache
      await cache.delete(`notifications:unread:${userId}`);

      return result.count;
    } catch (error) {
      console.error('[NotificationService] Failed to delete all notifications:', error);
      return 0;
    }
  }
}
