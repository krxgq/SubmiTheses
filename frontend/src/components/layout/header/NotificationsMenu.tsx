'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, X, ChevronDown } from 'lucide-react';
import { notificationsApi, type Notification as ApiNotification } from '@/lib/api/notifications';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: string;
  metadata?: Record<string, any>;
}

interface NotificationsMenuProps {
  inSidebar?: boolean;
}

export function NotificationsMenu({ inSidebar = false }: NotificationsMenuProps) {
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

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications every time menu opens (no polling — Sidebar handles background polling)
  useEffect(() => {
    if (showMenu) {
      fetchNotifications();
    }
  }, [showMenu]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getNotifications({ limit: 10 });
      const formattedNotifications: Notification[] = response.notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
        unread: !n.read,
        type: n.type,
        metadata: n.metadata,
      }));
      setNotifications(formattedNotifications);
      // Derive unread count from fetched notifications instead of a separate API call
      setUnreadCount(formattedNotifications.filter((n) => n.unread).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, unread: false }
            : notification
        )
      );
      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, unread: false }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const clearNotification = async (notificationId: string) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      // Update local state
      const wasUnread = notifications.find((n) => n.id === notificationId)?.unread;
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Sidebar style button
  if (inSidebar) {
    return (
      <div className="relative w-full" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-primary hover:bg-background-hover rounded-lg transition-colors"
        >
          <div className="flex items-center">
            <Bell className="w-4 h-4" />
            <span className="ml-3">{t('title')}</span>
            {unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-accent-danger text-text-inverse text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-background-elevated border border-border rounded-lg shadow-xl max-h-96 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primary">
                {t('title')}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-interactive-primary hover:text-interactive-primary-hover"
                >
                  {t('markAllAsRead')}
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b transition-colors hover:bg-background-hover ${
                      notification.unread ? 'bg-background-hover' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium truncate text-primary">
                            {getTranslatedTitle(notification)}
                          </p>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs mt-1 text-secondary">
                          {getTranslatedMessage(notification)}
                        </p>
                        <p className="text-xs mt-1 text-tertiary">
                          {notification.time}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {notification.unread && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-tertiary hover:text-primary transition-colors"
                            title={t('markAsRead')}
                          >
                            <div className="w-3 h-3 rounded-full border-border border-current"></div>
                          </button>
                        )}
                        <button
                          onClick={() => clearNotification(notification.id)}
                          className="p-1 text-tertiary hover:text-primary transition-colors"
                          title={t('deleteNotification')}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-secondary">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-tertiary" />
                  <p className="text-sm">{t('noNotifications')}</p>
                </div>
              )}
            </div>

            <div className="px-4 py-3 bg-background-secondary border-t border-border">
              <button className="w-full text-center text-sm text-primary hover:text-primary transition-colors">
                {t('viewAll')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Original header style button (for backwards compatibility)
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="relative p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-background-hover"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-danger text-text-inverse text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-80 bg-background-elevated border-border rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-primary">
              {t('title')}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-interactive-primary hover:text-interactive-primary-hover"
              >
                {t('markAllAsRead')}
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b transition-colors hover:bg-background-hover ${
                    notification.unread ? 'bg-background-hover' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium truncate text-primary">
                          {getTranslatedTitle(notification)}
                        </p>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs mt-1 text-secondary">
                        {getTranslatedMessage(notification)}
                      </p>
                      <p className="text-xs mt-1 text-tertiary">
                        {notification.time}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {notification.unread && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-tertiary hover:text-primary transition-colors"
                          title={t('markAsRead')}
                        >
                          <div className="w-3 h-3 rounded-full border-border border-current"></div>
                        </button>
                      )}
                      <button
                        onClick={() => clearNotification(notification.id)}
                        className="p-1 text-tertiary hover:text-primary transition-colors"
                        title={t('deleteNotification')}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-secondary">
                <Bell className="w-8 h-8 mx-auto mb-2 text-tertiary" />
                <p className="text-sm">{t('noNotifications')}</p>
              </div>
            )}
          </div>

          <div className="px-4 py-3 bg-background-secondary border-t border-border">
            <button className="w-full text-center text-sm text-primary hover:text-primary transition-colors">
              {t('viewAll')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
