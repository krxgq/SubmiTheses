import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';
import type { ActivityActionType, ActivityLogWithUser } from '@sumbi/shared-types';

/**
 * ActivityLogService - Handles logging and retrieval of project activities
 * Tracks actions like project creation, status changes, file uploads, user assignments, etc.
 */
export class ActivityLogService {
  /**
   * Log a project activity
   * Creates an activity log entry in the database
   *
   * @param projectId - Project ID
   * @param userId - User who performed the action
   * @param actionType - Type of activity (e.g., 'project_created', 'status_changed')
   * @param description - Short description of the activity
   * @param metadata - Optional metadata (e.g., old/new values for status changes)
   */
  static async logActivity(
    projectId: bigint,
    userId: string,
    actionType: ActivityActionType,
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await prisma.activity_logs.create({
        data: {
          project_id: projectId,
          user_id: userId,
          action_type: actionType,
          description,
          metadata: metadata,
        },
      });

      // Invalidate cache for this project's activities
      await cache.delete(`activities:project:${projectId}`);
    } catch (error) {
      // Log error but don't throw - activity logging shouldn't break main operations
      console.error('[ActivityLog] Failed to log activity:', error);
    }
  }

  /**
   * Get recent activities for a project
   * Returns the most recent activities with user information
   * Uses Redis cache for performance (30s TTL)
   *
   * @param projectId - Project ID
   * @param limit - Number of activities to return (default: 5)
   * @returns Array of activities with user information
   */
  static async getRecentActivities(
    projectId: bigint,
    limit: number = 5
  ): Promise<ActivityLogWithUser[]> {
    const cacheKey = `activities:project:${projectId}`;

    // Check cache
    const cached = await cache.get<ActivityLogWithUser[]>(cacheKey);
    if (cached) {
      return cached.slice(0, limit);
    }

    // Query database
    const activities = await prisma.activity_logs.findMany({
      where: { project_id: projectId },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    // Cache for 30 seconds (activities change frequently)
    await cache.set(cacheKey, activities, 30);

    return activities;
  }
}
