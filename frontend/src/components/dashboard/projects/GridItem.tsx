import type { ProjectWithRelations } from "@sumbi/shared-types";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";

interface GridItemProps {
  project: ProjectWithRelations;
  role: 'student' | 'teacher' | 'admin';
}

/**
 * Renders project cards with role-specific styling
 * - Student: Simple card with basic info
 * - Teacher: Card with student info
 * - Admin: Enhanced card with all participants and colored accent
 */
export function GridItem({project, role}: GridItemProps) {
  if (role === 'student') {
    return <StudentCard project={project} />;
  } else if (role === 'admin') {
    return <AdminCard project={project} />;
  } else {
    return <TeacherCard project={project} />;
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

function StudentCard({ project }: CardProps) {
  const t = useTranslations();

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-background-elevated cursor-pointer">
        <h2 className="text-lg font-semibold mb-2 text-text-primary truncate" title={project.title}>
          {project.title}
        </h2>

        <p className="text-sm text-text-tertiary mb-2">{project.subject}</p>

        <p className="text-text-secondary text-sm mb-3 line-clamp-2">
          {project.description || t('projects.noDescription')}
        </p>

        <div className="space-y-1 text-sm">
          <p className="text-text-secondary">
            <span className="font-medium">{t('projects.supervisor')}:</span>{' '}
            {project.supervisor?.full_name || t('common.unknown')}
          </p>
          <p className="text-text-secondary">
            <span className="font-medium">{t('projects.opponent')}:</span>{' '}
            {project.opponent?.full_name || t('common.unknown')}
          </p>
        </div>

        <p className="text-xs text-text-tertiary mt-3">
          {t('projects.lastUpdated')}: {formatDate(project.updated_at)}
        </p>
      </div>
    </Link>
  );
}

function TeacherCard({ project }: CardProps) {
  const t = useTranslations();

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-background-elevated cursor-pointer">
        <h2 className="text-lg font-semibold mb-2 text-text-primary truncate" title={project.title}>
          {project.title}
        </h2>

        <p className="text-sm text-text-tertiary mb-2">{project.subject}</p>

        <p className="text-text-secondary text-sm mb-3 line-clamp-2">
          {project.description || t('projects.noDescription')}
        </p>

        <div className="space-y-1 text-sm mb-3">
          <p className="text-text-secondary">
            <span className="font-medium">{t('projects.supervisor')}:</span>{' '}
            {project.supervisor?.full_name || t('common.unknown')}
          </p>
          <p className="text-text-secondary">
            <span className="font-medium">{t('projects.opponent')}:</span>{' '}
            {project.opponent?.full_name || t('common.unknown')}
          </p>

          <p className="text-text-secondary">
            <span className="font-medium">{t('projects.student')}:</span>{' '}
            {project.student?.full_name || project.student?.email || t('projects.noStudent')}
          </p>
        </div>

        <p className="text-xs text-text-tertiary">
          {t('projects.lastUpdated')}: {formatDate(project.updated_at)}
        </p>
      </div>
    </Link>
  );
}

function AdminCard({ project }: CardProps) {
  const t = useTranslations();

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="relative border-2 border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-background-elevated overflow-hidden cursor-pointer">
        {/* Colored accent bar on the left */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>

        <div className="pl-2">
          <h2 className="text-lg font-bold mb-2 text-text-primary truncate" title={project.title}>
            {project.title}
          </h2>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {project.subject}
            </span>
          </div>

          <p className="text-text-secondary text-sm mb-3 line-clamp-2">
            {project.description || t('projects.noDescription')}
          </p>

          {/* All participants in a compact grid */}
          <div className="grid grid-cols-1 gap-2 text-xs mb-3 bg-background p-2 rounded">
            <div className="flex items-start">
              <span className="font-semibold text-text-tertiary min-w-[70px]">{t('projects.supervisor')}:</span>
              <span className="text-text-secondary ml-2">{project.supervisor?.full_name || t('common.unknown')}</span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-text-tertiary min-w-[70px]">{t('projects.opponent')}:</span>
              <span className="text-text-secondary ml-2">{project.opponent?.full_name || t('common.unknown')}</span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-text-tertiary min-w-[70px]">{t('projects.student')}:</span>
              <span className="text-text-secondary ml-2">
                {project.student?.full_name || project.student?.email || (
                  <span className="italic text-text-tertiary">{t('projects.noStudent')}</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-xs text-text-tertiary">
              {t('projects.lastUpdated')}: {formatDate(project.updated_at)}
            </p>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
              ID: {project.id}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
