'use client';

import { useState } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'project' | 'review' | 'system' | 'info';
  timestamp: Date;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'New project submitted',
      message: 'John Doe submitted "AI Research Thesis" for review',
      time: '2 minutes ago',
      unread: true,
      type: 'project',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
    },
    {
      id: 2,
      title: 'Review completed',
      message: 'Sarah Wilson completed review for "Machine Learning Implementation"',
      time: '1 hour ago',
      unread: true,
      type: 'review',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
      id: 3,
      title: 'System update',
      message: 'New features have been deployed. Check out the updated project creation wizard.',
      time: '3 hours ago',
      unread: false,
      type: 'system',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: 4,
      title: 'Grade published',
      message: 'Your grade for "Data Structures Project" has been published.',
      time: '1 day ago',
      unread: false,
      type: 'info',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: 5,
      title: 'Deadline reminder',
      message: 'Project "Database Design" is due in 3 days.',
      time: '2 days ago',
      unread: false,
      type: 'info',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => n.unread).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter((n) => n.unread)
    : notifications;

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

  const deleteNotification = (notificationId: number) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'review':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-secondary" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Notifications</h1>
        <p className="text-secondary">
          {unreadCount > 0 
            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
            : 'You are all caught up!'
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
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-primary text-text-inverse'
                  : 'bg-background-secondary text-primary hover:bg-background-hover'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-primary hover:bg-background-hover rounded-lg transition-colors"
              >
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear all
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
                          {notification.title}
                        </h3>
                        {notification.unread && (
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-secondary mb-2">
                        {notification.message}
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
                          title="Mark as read"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-tertiary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        title="Delete notification"
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
              No notifications
            </h3>
            <p className="text-secondary">
              {filter === 'unread' 
                ? "You don't have any unread notifications"
                : "You don't have any notifications yet"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
