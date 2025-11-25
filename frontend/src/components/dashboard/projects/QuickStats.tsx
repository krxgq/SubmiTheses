import type { ProjectWithRelations } from '@sumbi/shared-types';

interface QuickStatsProps {
  project: ProjectWithRelations;
  // Future: will be populated from related entities
  attachmentsCount?: number;
  reviewsCount?: number;
  linksCount?: number;
}

/**
 * Quick stats sidebar showing project metrics
 * Displays counts for attachments, reviews, grades, and key dates
 */
export default function QuickStats({
  project,
  attachmentsCount = 4,
  reviewsCount = 3,
  linksCount = 2
}: QuickStatsProps) {
  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-background-elevated rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Stats</h3>

      <div className="space-y-4">
        {/* Total Attachments */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Total Attachments</span>
          <span className="text-sm font-semibold text-text-primary">{attachmentsCount}</span>
        </div>

        {/* Reviews */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Reviews</span>
          <span className="text-sm font-semibold text-text-primary">{reviewsCount}</span>
        </div>

        {/* External Links */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">External Links</span>
          <span className="text-sm font-semibold text-text-primary">{linksCount}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-4"></div>

        {/* Current Grade - Placeholder for future */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Current Grade</span>
          <span className="px-2 py-1 bg-background-secondary text-[var(--color-warning)] text-xs font-medium rounded">
            Pending
          </span>
        </div>

        {/* Submission Date - Using updated_at as placeholder */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Submission Date</span>
          <span className="text-sm font-semibold text-text-primary">
            Dec 15, 2024
          </span>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Last Updated</span>
          <span className="text-sm font-semibold text-text-primary">
            {formatDate(project.updated_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
