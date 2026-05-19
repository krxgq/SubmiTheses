import { projectsApiServer } from '@/lib/api/projects';
import { formatDistanceToNow } from 'date-fns';
import type { ActivityLogWithUser } from '@sumbi/shared-types';
import { getTranslations } from 'next-intl/server';
import { Sparkles, RefreshCw, Upload, Trash2, UserRound, GraduationCap, Users, PenLine, Dot } from 'lucide-react';

interface RecentActivityProps {
  projectId: string;
}

/**
 * Recent activity timeline for project
 * Shows last 5 activities from activity_logs table
 * Displays activities like project creation, status changes, file uploads, user assignments
 */
export default async function RecentActivity({ projectId }: RecentActivityProps) {
  const t = await getTranslations('projectDetail.recentActivity');
  let activities: ActivityLogWithUser[] = [];

  try {
    const response = await projectsApiServer.getProjectActivities(projectId, 5);
    activities = response.activities;
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    // Return empty state on error
    return (
      <div className="bg-background-elevated rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">{t('title')}</h3>
        <p className="text-sm text-text-secondary">{t('noActivity')}</p>
      </div>
    );
  }

  // Map action types to Lucide icon components for consistent sizing/theming
  const getActivityIcon = (actionType: string) => {
    const cls = 'w-4 h-4 text-text-secondary';
    switch (actionType) {
      case 'project_created': return <Sparkles className={cls} />;
      case 'status_changed': return <RefreshCw className={cls} />;
      case 'file_uploaded': return <Upload className={cls} />;
      case 'file_deleted': return <Trash2 className={cls} />;
      case 'student_assigned':
      case 'student_removed': return <UserRound className={cls} />;
      case 'supervisor_assigned':
      case 'supervisor_removed': return <GraduationCap className={cls} />;
      case 'opponent_assigned':
      case 'opponent_removed': return <Users className={cls} />;
      case 'project_updated': return <PenLine className={cls} />;
      default: return <Dot className={cls} />;
    }
  };

  return (
    <div className="bg-background-elevated rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">{t('title')}</h3>

      {activities.length === 0 ? (
        <p className="text-sm text-text-secondary">{t('noActivity')}</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id.toString()} className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-8 h-8 rounded-full bg-background-secondary flex items-center justify-center text-sm flex-shrink-0">
                {getActivityIcon(activity.action_type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary font-medium">
                  {activity.description}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
