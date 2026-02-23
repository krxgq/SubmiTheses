'use client';

import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';
import { notificationsApi } from '@/lib/api/notifications';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export default function NotificationsPage() {
  const t = useTranslations('notifications');

  // Resolve translated title/message using type + variant, fallback to raw text for old notifications
  const getTranslatedTitle = (notification: Notification): string => {
    if (!notification.metadata?.projectTitle) return notification.title;
    const variant = notification.metadata?.variant;
    const key = variant ? `${notification.type}_${variant}` : notification.type;
    return t(`titles_i18n.${key}`, notification.metadata);
  };

  const getTranslatedMessage = (notification: Notification): string => {
    if (!notification.metadata?.projectTitle) return notification.message;
    const variant = notification.metadata?.variant;
    const key = variant ? `${notification.type}_${variant}` : notification.type;
    return t(`messages_i18n.${key}`, notification.metadata);
  };
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getNotifications({ limit: 50 });
      const formattedNotifications: Notification[] = response.notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
        unread: !n.read,
        type: n.type,
        timestamp: new Date(n.created_at),
        metadata: n.metadata,
      }));
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;
  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => n.unread)
    : notifications;

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, unread: false }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, unread: false }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAll = async () => {
    if (confirm(t('clearAllConfirm'))) {
      try {
        // Delete all notifications one by one (no batch delete endpoint)
        await Promise.all(notifications.map(n => notificationsApi.deleteNotification(n.id)));
        setNotifications([]);
      } catch (error) {
        console.error('Failed to clear all notifications:', error);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Bell className="w-5 h-5 text-primary" />;
      case 'review':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'info':
        return <Info className="w-5 h-5 text-accent" />;
      default:
        return <Bell className="w-5 h-5 text-secondary" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-secondary">{t('loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">{t('title')}</h1>
        <p className="text-secondary">
          {unreadCount > 0
            ? t('unreadCount', { count: unreadCount })
            : t('allCaughtUp')
          }
        </p>
      </div>

      {/* Controls */}
      <div className="bg-background-elevated border border-border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-text-inverse'
                  : 'bg-background-secondary text-primary hover:bg-background-hover'
              }`}
            >
              {t('filters.all')} ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-primary text-text-inverse'
                  : 'bg-background-secondary text-primary hover:bg-background-hover'
              }`}
            >
              {t('filters.unread')} ({unreadCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-primary hover:bg-background-hover rounded-lg transition-colors"
              >
                {t('markAllAsRead')}
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t('clearAll')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-background-elevated border border-border rounded-lg p-4 transition-all hover:shadow-md ${
                notification.unread ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-primary">
                          {getTranslatedTitle(notification)}
                        </h3>
                        {notification.unread && (
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-secondary mb-2">
                        {getTranslatedMessage(notification)}
                      </p>
                      <p className="text-xs text-tertiary">
                        {notification.time}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {notification.unread && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-tertiary hover:text-primary hover:bg-background-hover rounded-lg transition-colors"
                          title={t('markAsRead')}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-tertiary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        title={t('deleteNotification')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-background-elevated border border-border rounded-lg p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-tertiary" />
            <h3 className="text-lg font-semibold text-primary mb-2">
              {t('noNotifications')}
            </h3>
            <p className="text-secondary">
              {filter === 'unread'
                ? t('noUnreadNotifications')
                : t('noNotificationsDescription')
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
