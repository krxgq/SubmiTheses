import type { ProjectWithRelations } from "@sumbi/shared-types";
import { formatUserName } from "@/lib/formatters";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Badge } from "@/components/ui/Badge";
import { Clock } from "lucide-react";

interface ListItemProps {
  project: ProjectWithRelations;
  role: 'student' | 'teacher' | 'admin';
}

/**
 * Unified horizontal project card for list view
 * - Matches GridItem styling but in horizontal layout
 * - Responsive: hides some columns on smaller screens
 */
export function ListItem({project, role}: ListItemProps) {
  const t = useTranslations();

  // Format date helper
  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <div className="border border-border rounded-xl p-3 sm:p-6 hover:shadow-md hover:border-border-strong transition-all duration-200 bg-background-elevated cursor-pointer">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Left: Badge + Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" size="sm">
                {project.subject}
              </Badge>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-text-primary line-clamp-2 sm:truncate" title={project.title}>
              {project.title}
            </h2>
          </div>

          {/* Middle: Participants (responsive - hide on small screens) */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            {/* Student (for teachers/admins) */}
            {(role === 'teacher' || role === 'admin') && (
              <div className="min-w-[140px]">
                <span className="text-text-secondary block text-xs mb-1">
                  {t('projects.student')}
                </span>
                <span className="font-medium text-text-primary truncate block">
                  {formatUserName(project.student?.first_name, project.student?.last_name) ||
                   project.student?.email ||
                   t('projects.noStudent')}
                </span>
              </div>
            )}

            {/* Supervisor */}
            <div className="min-w-[140px]">
              <span className="text-text-secondary block text-xs mb-1">
                {t('projects.supervisor')}
              </span>
              <span className="font-medium text-text-primary truncate block">
                {formatUserName(project.supervisor?.first_name, project.supervisor?.last_name) ||
                 t('common.unassigned')}
              </span>
            </div>

            {/* Opponent (hide on medium, show on large) */}
            <div className="hidden lg:block min-w-[140px]">
              <span className="text-text-secondary block text-xs mb-1">
                {t('projects.opponent')}
              </span>
              <span className="font-medium text-text-primary truncate block">
                {formatUserName(project.opponent?.first_name, project.opponent?.last_name) ||
                 t('common.unassigned')}
              </span>
            </div>
          </div>

          {/* Right: Last Updated */}
          <div className="flex items-center gap-2 text-xs text-text-tertiary min-w-[100px] sm:min-w-[120px]">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs">{formatDate(project.updated_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
