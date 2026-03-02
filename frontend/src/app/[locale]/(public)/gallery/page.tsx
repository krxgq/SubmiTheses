import { getTranslations } from "next-intl/server";
import { publicProjectsApi } from "@/lib/api/projects";
import type { ProjectWithRelations } from "@sumbi/shared-types";
import { GalleryPageClient } from "./GalleryPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Public gallery page — lists all published projects for unauthenticated visitors.
 * Uses the /projects/public backend endpoint (no auth needed).
 */
export default async function GalleryPage() {
  const t = await getTranslations();

  let projects: ProjectWithRelations[] = [];
  try {
    projects = await publicProjectsApi.getAll();
  } catch (error) {
    console.error("[GalleryPage] Error fetching public projects:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <GalleryPageClient projects={projects} />
    </div>
  );
}
