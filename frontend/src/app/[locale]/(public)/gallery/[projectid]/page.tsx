import { publicProjectsApi } from "@/lib/api/projects";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import ProjectHeader from "@/components/dashboard/projects/ProjectHeader";
import ProjectOverview from "@/components/dashboard/projects/ProjectOverview";
import PublicAttachmentsList from "@/components/public/PublicAttachmentsList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface GalleryProjectPageProps {
  params: Promise<{ locale: string; projectid: string }>;
}

/**
 * Public project detail page — read-only view for unauthenticated visitors.
 * Shows header + overview only. No actions, tabs, activity, or grades.
 */
export default async function GalleryProjectPage({ params }: GalleryProjectPageProps) {
  const { locale, projectid } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projectDetail");

  let project;
  try {
    project = await publicProjectsApi.getById(projectid);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Header with title and status */}
        <ProjectHeader project={project} />

        {/* Single-column layout — overview + documentation only */}
        <div className="max-w-4xl space-y-6">
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

          {/* Public attachments — download-only, no upload */}
          <PublicAttachmentsList projectId={projectid} />
        </div>
      </div>
    </div>
  );
}
