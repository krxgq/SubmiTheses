interface ActivityItemProps {
  message: string;
  timestamp: string;
  type: 'success' | 'info' | 'warning';
}

function ActivityItem({ message, timestamp, type }: ActivityItemProps) {
  const getDotColor = () => {
    switch (type) {
      case 'success':
        return 'bg-success';
      case 'info':
        return 'bg-primary';
      case 'warning':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="flex items-center">
      <div className={`w-2 h-2 ${getDotColor()} rounded-full mr-4`}></div>
      <p className="text-sm text-secondary">
        {message}
      </p>
      <span className="ml-auto text-xs text-tertiary">
        {timestamp}
      </span>
    </div>
  );
}

interface RecentActivityProps {
  activities: Array<{
    message: string;
    timestamp: string;
    type: 'success' | 'info' | 'warning';
  }>;
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-background-elevated shadow-sm border-t border-border w-full">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-primary">
          Recent Activity
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <ActivityItem
              key={index}
              message={activity.message}
              timestamp={activity.timestamp}
              type={activity.type}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
