/**
 * Recent activity timeline for project
 * Shows recent changes, uploads, reviews, etc.
 * Placeholder implementation - full logic deferred to future
 */
export default function RecentActivity() {
  // Mock activity data - will be replaced with real data in future
  const activities = [
    {
      id: 1,
      type: 'upload',
      description: 'File uploaded',
      time: '2 hours ago',
      icon: '📄'
    },
    {
      id: 2,
      type: 'review',
      description: 'Review added',
      time: '1 day ago',
      icon: '✍️'
    },
    {
      id: 3,
      type: 'update',
      description: 'Documentation updated',
      time: '3 days ago',
      icon: '📝'
    }
  ];

  return (
    <div className="bg-background-elevated rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-8 h-8 rounded-full bg-background-secondary flex items-center justify-center text-sm flex-shrink-0">
              {activity.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary font-medium">
                {activity.description}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* View all link - placeholder */}
      <button className="mt-4 text-sm text-text-accent hover:text-interactive-primary-hover font-medium">
        View all activity
      </button>
    </div>
  );
}
