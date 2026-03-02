import type { ProjectWithRelations } from "@sumbi/shared-types";
import { formatUserName } from "@/lib/formatters";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Badge } from "@/components/ui/Badge";
import { User, Users, GraduationCap, Check } from "lucide-react";

interface GridItemProps {
  project: ProjectWithRelations;
  role: 'student' | 'teacher' | 'admin';
  basePath?: string;
  selectable?: boolean;   // enables checkbox selection mode
  selected?: boolean;     // whether this card is currently selected
  onSelect?: (id: number) => void; // callback when card is toggled
}

/**
 * Unified project card design for all roles
 * - Same visual design regardless of role
 * - Different content based on what the role needs to see
 * - When selectable: clicking toggles selection instead of navigating
 */
export function GridItem({project, role, basePath = "/projects", selectable, selected, onSelect}: GridItemProps) {
  const t = useTranslations();

  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Shared card inner markup
  const cardInner = (
    <>
      {/* Selection checkbox indicator (top-right corner) */}
      {selectable && (
        <div className={`absolute top-3 right-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          selected ? 'bg-accent-primary border-accent-primary' : 'border-border-strong bg-background-elevated'
        }`}>
          {selected && <Check size={14} className="text-white" />}
        </div>
      )}

      {/* Top: Badges — subject + status */}
      <div className="flex items-center flex-wrap gap-2 mb-3">
        <Badge variant="primary" size="sm">
          {project.subject}
        </Badge>
        {project.status && (
          <Badge
            variant={project.status === 'public' ? 'success' : project.status === 'locked' ? 'warning' : 'neutral'}
            size="sm"
            dot
          >
            {t(`projects.status.${project.status}`)}
          </Badge>
        )}
      </div>

      {/* Title */}
      <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-2 line-clamp-2" title={project.title}>
        {project.title}
      </h2>

      {/* Description */}
      <p className="text-xs sm:text-sm text-text-secondary mb-4 line-clamp-2">
        {project.description || t('projects.noDescription')}
      </p>

      {/* Participant Info */}
      <div className="bg-background-secondary/50 rounded-lg p-3 mb-4 space-y-2">
        {(role === 'teacher' || role === 'admin') && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-text-tertiary flex-shrink-0" />
            <span className="text-sm text-text-secondary">{t('projects.student')}:</span>
            <span className="text-sm font-medium text-text-primary truncate">
              {formatUserName(project.student?.first_name, project.student?.last_name) ||
               project.student?.email || t('projects.noStudent')}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-text-tertiary flex-shrink-0" />
          <span className="text-sm text-text-secondary">{t('projects.supervisor')}:</span>
          <span className="text-sm font-medium text-text-primary truncate">
            {formatUserName(project.supervisor?.first_name, project.supervisor?.last_name) || t('common.unassigned')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-text-tertiary flex-shrink-0" />
          <span className="text-sm text-text-secondary">{t('projects.opponent')}:</span>
          <span className="text-sm font-medium text-text-primary truncate">
            {formatUserName(project.opponent?.first_name, project.opponent?.last_name) || t('common.unassigned')}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <p className="text-xs text-text-tertiary">
          {t('projects.lastUpdated')}: {formatDate(project.updated_at)}
        </p>
      </div>
    </>
  );

  const cardClasses = `border rounded-xl p-3 sm:p-6 hover:shadow-md hover:border-border-strong transition-all duration-200 bg-background-elevated cursor-pointer relative ${
    selected ? 'border-accent-primary ring-2 ring-accent-primary/30' : 'border-border'
  }`;

  // In select mode: div wrapper with click handler; otherwise: Link for navigation
  if (selectable) {
    return (
      <div className="block" onClick={() => onSelect?.(Number(project.id))}>
        <div className={cardClasses}>{cardInner}</div>
      </div>
    );
  }

  return (
    <Link href={`${basePath}/${project.id}`} className="block">
      <div className={cardClasses}>{cardInner}</div>
    </Link>
  );
}
