import type { ProjectWithRelations } from "@sumbi/shared-types";
import { formatUserName } from "@/lib/formatters";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Badge } from "@/components/ui/Badge";
import { User, Users, GraduationCap } from "lucide-react";

interface GridItemProps {
  project: ProjectWithRelations;
  role: 'student' | 'teacher' | 'admin';
}

/**
 * Unified project card design for all roles
 * - Same visual design regardless of role
 * - Different content based on what the role needs to see
 * - Modern, clean, professional styling
 */
export function GridItem({project, role}: GridItemProps) {
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
        {/* Top: Badges */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <Badge variant="primary" size="sm">
            {project.subject}
          </Badge>
          {/* Optional: Add status badge if you have status field */}
          {/* <Badge variant="success" size="sm">Active</Badge> */}
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-2 line-clamp-2" title={project.title}>
          {project.title}
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-text-secondary mb-4 line-clamp-2">
          {project.description || t('projects.noDescription')}
        </p>

        {/* Participant Info Section - Clean background box */}
        <div className="bg-background-secondary/50 rounded-lg p-3 mb-4 space-y-2">
          {/* Student info (show for teachers and admins) */}
          {(role === 'teacher' || role === 'admin') && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-text-tertiary flex-shrink-0" />
              <span className="text-sm text-text-secondary">
                {t('projects.student')}:
              </span>
              <span className="text-sm font-medium text-text-primary truncate">
                {formatUserName(project.student?.first_name, project.student?.last_name) ||
                 project.student?.email ||
                 t('projects.noStudent')}
              </span>
            </div>
          )}

          {/* Supervisor */}
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-text-tertiary flex-shrink-0" />
            <span className="text-sm text-text-secondary">
              {t('projects.supervisor')}:
            </span>
            <span className="text-sm font-medium text-text-primary truncate">
              {formatUserName(project.supervisor?.first_name, project.supervisor?.last_name) ||
               t('common.unassigned')}
            </span>
          </div>

          {/* Opponent */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-text-tertiary flex-shrink-0" />
            <span className="text-sm text-text-secondary">
              {t('projects.opponent')}:
            </span>
            <span className="text-sm font-medium text-text-primary truncate">
              {formatUserName(project.opponent?.first_name, project.opponent?.last_name) ||
               t('common.unassigned')}
            </span>
          </div>
        </div>

        {/* Footer: Last Updated */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-text-tertiary">
            {t('projects.lastUpdated')}: {formatDate(project.updated_at)}
          </p>
        </div>
      </div>
    </Link>
  );
}
