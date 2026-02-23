import { Request, Response } from 'express';
import { NotificationService, NotificationFilters } from '../services/notifications.service';


export class NotificationsController {

  /**
   * GET /api/notifications
   * Get all notifications for the authenticated user
   * Query params: limit, offset, read (boolean), type
   */
  static async getNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      // Parse query parameters
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const filters: NotificationFilters = {};

      if (req.query.read !== undefined) {
        filters.read = req.query.read === 'true';
      }

      if (req.query.type) {
        filters.type = req.query.type as any;
      }

      const result = await NotificationService.getUserNotifications(
        userId,
        filters,
        { limit, offset }
      );

      res.json(result);
    } catch (error) {
      console.error('[NotificationsController] Error getting notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Get count of unread notifications (cached for performance)
   */
  static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const count = await NotificationService.getUnreadCount(userId);

      res.json({ count });
    } catch (error) {
      console.error('[NotificationsController] Error getting unread count:', error);
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  }

  /**
   * PUT /api/notifications/:id/read
   * Mark a specific notification as read
   */
  static async markAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const notificationId = BigInt(req.params.id);

      const success = await NotificationService.markAsRead(notificationId, userId);

      if (success) {
        res.json({ message: 'Notification marked as read' });
      } else {
        res.status(404).json({ error: 'Notification not found or already read' });
      }
    } catch (error) {
     console.error('[NotificationsController] Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  /**
   * PUT /api/notifications/mark-all-read
   * Mark all unread notifications as read for the user
   */
  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const count = await NotificationService.markAllAsRead(userId);

      res.json({ message: `Marked ${count} notifications as read`, count });
    } catch (error) {
      console.error('[NotificationsController] Error marking all as read:', error);
      res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Delete a specific notification
   */
  static async deleteNotification(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const notificationId = BigInt(req.params.id);

      const success = await NotificationService.deleteNotification(notificationId, userId);

      if (success) {
        res.json({ message: 'Notification deleted' });
      } else {
        res.status(404).json({ error: 'Notification not found' });
      }
    } catch (error) {
      console.error('[NotificationsController] Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  }
}
