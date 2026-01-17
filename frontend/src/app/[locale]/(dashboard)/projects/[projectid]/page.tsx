import { projectsApiServer } from "@/lib/api/projects";
import { ApiError } from "@/lib/api/client";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import ProjectHeader from "@/components/dashboard/projects/ProjectHeader";
import ProjectOverview from "@/components/dashboard/projects/ProjectOverview";
import QuickStats from "@/components/dashboard/projects/QuickStats";
import ProjectActions from "@/components/dashboard/projects/ProjectActions";
import RecentActivity from "@/components/dashboard/projects/RecentActivity";
import ProjectTabs from "@/components/dashboard/projects/ProjectTabs";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProjectPageProps {
  params: Promise<{ locale: string; projectid: string }>;
}

/**
 * Project detail page - displays comprehensive project information
 * Server Component that fetches project data and composes reusable components
 * Access control: All authenticated users can access (backend validates specific project access)
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, projectid } = await params;

  setRequestLocale(locale);
  const t = await getTranslations("projectDetail");

  let project;
  try {
    project = await projectsApiServer.getProjectById(projectid);
  } catch (error) {
    // Distinguish between 403 (access denied) and 404 (not found)
    if (error instanceof ApiError && error.statusCode === 403) {
      // 403 Forbidden - return null, layout will show AccessDenied component
      return null;
    }

    // 404 or other errors - show Next.js not found page
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Header with title, status, breadcrumbs */}
        <ProjectHeader project={project} />

        {/* Main content grid: 2 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Main content (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <ProjectOverview project={project} />

            {/* Main documentation section */}
            {project?.main_documentation && (
              <div className="bg-background-elevated rounded-lg border border-border p-3 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">
                  {t("mainDocumentation")}
                </h2>
                <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
                  {project.main_documentation}
                </p>
              </div>
            )}

            {/* Tabs: Attachments, Links, Reviews, Grades */}
            <ProjectTabs projectId={projectid} project={project} />
          </div>

          {/* Right column: Sidebar (1/3 width) */}
          <div className="space-y-6">
            <QuickStats project={project} />
            <ProjectActions project={project} />
            <RecentActivity projectId={projectid} />
          </div>
        </div>
      </div>
    </div>
  );
}
