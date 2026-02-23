import { apiRequest } from './client';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationFilters {
  read?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

/**
 * Notifications API
 * All endpoints require authentication
 */
export const notificationsApi = {
  /**
   * Get all notifications for the current user
   * @param filters - Optional filters (read status, type, pagination)
   */
  getNotifications: async (filters?: NotificationFilters): Promise<NotificationsResponse> => {
    const params = new URLSearchParams();

    if (filters?.read !== undefined) {
      params.append('read', filters.read.toString());
    }
    if (filters?.type) {
      params.append('type', filters.type);
    }
    if (filters?.limit !== undefined) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.offset !== undefined) {
      params.append('offset', filters.offset.toString());
    }

    const queryString = params.toString();
    const url = `/notifications${queryString ? `?${queryString}` : ''}`;

    return apiRequest<NotificationsResponse>(url);
  },

  /**
   * Get count of unread notifications
   * Used for the notification badge
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiRequest<UnreadCountResponse>('/notifications/unread-count');
    return response.count;
  },

  /**
   * Mark a specific notification as read
   * @param id - Notification ID
   */
  markAsRead: async (id: string | number): Promise<void> => {
    await apiRequest<{ message: string }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ count: number }> => {
    return apiRequest<{ count: number; message: string }>('/notifications/mark-all-read', {
      method: 'PUT',
    });
  },

  /**
   * Delete a notification
   * @param id - Notification ID
   */
  deleteNotification: async (id: string | number): Promise<void> => {
    await apiRequest<{ message: string }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },
};
