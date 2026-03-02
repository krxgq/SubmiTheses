import type { ProjectWithRelations } from "@sumbi/shared-types";
import { formatUserName } from "@/lib/formatters";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Badge } from "@/components/ui/Badge";
import { Clock, Check } from "lucide-react";

interface ListItemProps {
  project: ProjectWithRelations;
  role: 'student' | 'teacher' | 'admin';
  basePath?: string;
  selectable?: boolean;   // enables checkbox selection mode
  selected?: boolean;     // whether this row is currently selected
  onSelect?: (id: number) => void; // callback when row is toggled
}

/**
 * Unified horizontal project card for list view
 * When selectable: checkbox on left, clicking toggles selection
 */
export function ListItem({project, role, basePath = "/projects", selectable, selected, onSelect}: ListItemProps) {
  const t = useTranslations();

  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const rowClasses = `border rounded-xl p-3 sm:p-6 hover:shadow-md hover:border-border-strong transition-all duration-200 bg-background-elevated cursor-pointer ${
    selected ? 'border-accent-primary ring-2 ring-accent-primary/30' : 'border-border'
  }`;

  const rowInner = (
    <div className={rowClasses}>
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Checkbox (only in select mode) */}
        {selectable && (
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            selected ? 'bg-accent-primary border-accent-primary' : 'border-border-strong bg-background-elevated'
          }`}>
            {selected && <Check size={14} className="text-white" />}
          </div>
        )}

        {/* Left: Badge + Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
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
          <h2 className="text-base sm:text-lg font-bold text-text-primary line-clamp-2 sm:truncate" title={project.title}>
            {project.title}
          </h2>
        </div>

        {/* Middle: Participants */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {(role === 'teacher' || role === 'admin') && (
            <div className="min-w-[140px]">
              <span className="text-text-secondary block text-xs mb-1">{t('projects.student')}</span>
              <span className="font-medium text-text-primary truncate block">
                {formatUserName(project.student?.first_name, project.student?.last_name) ||
                 project.student?.email || t('projects.noStudent')}
              </span>
            </div>
          )}
          <div className="min-w-[140px]">
            <span className="text-text-secondary block text-xs mb-1">{t('projects.supervisor')}</span>
            <span className="font-medium text-text-primary truncate block">
              {formatUserName(project.supervisor?.first_name, project.supervisor?.last_name) || t('common.unassigned')}
            </span>
          </div>
          <div className="hidden lg:block min-w-[140px]">
            <span className="text-text-secondary block text-xs mb-1">{t('projects.opponent')}</span>
            <span className="font-medium text-text-primary truncate block">
              {formatUserName(project.opponent?.first_name, project.opponent?.last_name) || t('common.unassigned')}
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
  );

  // In select mode: div wrapper with click handler; otherwise: Link for navigation
  if (selectable) {
    return (
      <div className="block" onClick={() => onSelect?.(Number(project.id))}>
        {rowInner}
      </div>
    );
  }

  return (
    <Link href={`${basePath}/${project.id}`} className="block">
      {rowInner}
    </Link>
  );
}
