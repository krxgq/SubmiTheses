import type { ProjectWithRelations } from "@sumbi/shared-types";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";

interface ListItemProps {
  project: ProjectWithRelations;
  role: 'student' | 'teacher' | 'admin';
}

/**
 * Renders project list items with role-specific horizontal layout
 * - Student: Simple row with basic info
 * - Teacher: Row with student info included
 * - Admin: Enhanced row with all participants and colored accent
 */
export function ListItem({project, role}: ListItemProps) {
  if (role === 'student') {
    return <StudentListCard project={project} />;
  } else if (role === 'admin') {
    return <AdminListCard project={project} />;
  } else {
    return <TeacherListCard project={project} />;
  }
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

interface CardProps {
  project: ProjectWithRelations;
}

function StudentListCard({ project }: CardProps) {
  const t = useTranslations();

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="flex items-center gap-4 border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-background-elevated cursor-pointer">
        {/* Title - 30% width */}
        <div className="flex-[3] min-w-0">
          <h3 className="font-semibold text-text-primary truncate" title={project.title}>
            {project.title}
          </h3>
          <span className="text-xs text-text-tertiary">{project.subject}</span>
        </div>

        {/* Supervisor - 20% */}
        <div className="flex-[2] min-w-0 hidden md:block">
          <p className="text-sm text-text-secondary truncate">
            <span className="font-medium">{t('projects.supervisor')}:</span>{' '}
            {project.supervisor?.full_name || t('common.unknown')}
          </p>
        </div>

        {/* Opponent - 20% */}
        <div className="flex-[2] min-w-0 hidden lg:block">
          <p className="text-sm text-text-secondary truncate">
            <span className="font-medium">{t('projects.opponent')}:</span>{' '}
            {project.opponent?.full_name || t('common.unknown')}
          </p>
        </div>

        {/* Last Updated - 15% */}
        <div className="flex-[1.5] min-w-0 text-right">
          <p className="text-xs text-text-tertiary">
            {formatDate(project.updated_at)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function TeacherListCard({ project }: CardProps) {
  const t = useTranslations();

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="flex items-center gap-4 border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-background-elevated cursor-pointer">
        {/* Title - 25% width */}
        <div className="flex-[2.5] min-w-0">
          <h3 className="font-semibold text-text-primary truncate" title={project.title}>
            {project.title}
          </h3>
          <span className="text-xs text-text-tertiary">{project.subject}</span>
        </div>

        {/* Student - 20% */}
        <div className="flex-[2] min-w-0 hidden sm:block">
          <p className="text-sm text-text-secondary truncate">
            <span className="font-medium">{t('projects.student')}:</span>{' '}
            {project.student?.full_name || project.student?.email || t('projects.noStudent')}
          </p>
        </div>

        {/* Supervisor - 18% */}
        <div className="flex-[1.8] min-w-0 hidden md:block">
          <p className="text-sm text-text-secondary truncate">
            <span className="font-medium">{t('projects.supervisor')}:</span>{' '}
            {project.supervisor?.full_name || t('common.unknown')}
          </p>
        </div>

        {/* Opponent - 18% */}
        <div className="flex-[1.8] min-w-0 hidden lg:block">
          <p className="text-sm text-text-secondary truncate">
            <span className="font-medium">{t('projects.opponent')}:</span>{' '}
            {project.opponent?.full_name || t('common.unknown')}
          </p>
        </div>

        {/* Last Updated - 15% */}
        <div className="flex-[1.5] min-w-0 text-right">
          <p className="text-xs text-text-tertiary">
            {formatDate(project.updated_at)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function AdminListCard({ project }: CardProps) {
  const t = useTranslations();

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="relative flex items-center gap-4 border-2 border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-background-elevated overflow-hidden cursor-pointer">
        {/* Colored accent bar on the left */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>

        {/* Content with left padding */}
        <div className="flex items-center gap-4 flex-1 pl-2">
          {/* Title & ID - 25% width */}
          <div className="flex-[2.5] min-w-0">
            <h3 className="font-bold text-text-primary truncate" title={project.title}>
              {project.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {project.subject}
              </span>
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                ID: {project.id}
              </span>
            </div>
          </div>

          {/* Student - 18% */}
          <div className="flex-[1.8] min-w-0 hidden sm:block">
            <p className="text-xs text-text-tertiary font-semibold">{t('projects.student')}</p>
            <p className="text-sm text-text-secondary truncate">
              {project.student?.full_name || project.student?.email || (
                <span className="italic text-text-tertiary">{t('projects.noStudent')}</span>
              )}
            </p>
          </div>

          {/* Supervisor - 18% */}
          <div className="flex-[1.8] min-w-0 hidden md:block">
            <p className="text-xs text-text-tertiary font-semibold">{t('projects.supervisor')}</p>
            <p className="text-sm text-text-secondary truncate">
              {project.supervisor?.full_name || t('common.unknown')}
            </p>
          </div>

          {/* Opponent - 18% */}
          <div className="flex-[1.8] min-w-0 hidden lg:block">
            <p className="text-xs text-text-tertiary font-semibold">{t('projects.opponent')}</p>
            <p className="text-sm text-text-secondary truncate">
              {project.opponent?.full_name || t('common.unknown')}
            </p>
          </div>

          {/* Last Updated - 12% */}
          <div className="flex-[1.2] min-w-0 text-right">
            <p className="text-xs text-text-tertiary">
              {formatDate(project.updated_at)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
