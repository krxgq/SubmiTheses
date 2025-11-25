'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: string;
}

export function NotificationsMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'New project submitted',
      message: 'John Doe submitted "AI Research Thesis"',
      time: '2 minutes ago',
      unread: true,
      type: 'project',
    },
    {
      id: 2,
      title: 'Review completed',
      message: 'Sarah Wilson completed review for "Machine Learning"',
      time: '1 hour ago',
      unread: true,
      type: 'review',
    },
    {
      id: 3,
      title: 'System update',
      message: 'New features have been deployed',
      time: '3 hours ago',
      unread: false,
      type: 'system',
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

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

  const markAsRead = (notificationId: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, unread: false }))
    );
  };

  const clearNotification = (notificationId: number) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

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
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-interactive-primary hover:text-interactive-primary-hover"
              >
                Mark all as read
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
                          {notification.title}
                        </p>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs mt-1 text-secondary">
                        {notification.message}
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
                          title="Mark as read"
                        >
                          <div className="w-3 h-3 rounded-full border-border border-current"></div>
                        </button>
                      )}
                      <button
                        onClick={() => clearNotification(notification.id)}
                        className="p-1 text-tertiary hover:text-primary transition-colors"
                        title="Clear notification"
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
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </div>

          <div className="px-4 py-3 bg-background-secondary border-t border-border">
            <button className="w-full text-center text-sm text-primary hover:text-primary transition-colors">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
