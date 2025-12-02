import { getTranslations } from "next-intl/server";
import { projectsApi } from "@/lib/api/projects";
import { ProjectsPageClient } from "./ProjectsPage";
import { checkRole } from "@/lib/auth/require-role";
import type { ProjectWithRelations } from "@sumbi/shared-types";

// Page component - access protected by middleware (all authenticated users)
export default async function ProjectsPage() {
  const t = await getTranslations();

  // Get role and userId for data fetching
  const { role, userId } = await checkRole();
  const userRole = role || 'student';

  let projects: ProjectWithRelations[] = [];
  try {
    projects = await projectsApi.getAllProjects();
  } catch (error) {
    console.error('[ProjectsPage] Error fetching projects:', error);
    // Gracefully handle error - show empty projects list
  }

  return (
    <div className="w-full">
      <ProjectsPageClient
        projects={projects}
        userRole={userRole}
        userId={userId}
      />
    </div>
  );
}
