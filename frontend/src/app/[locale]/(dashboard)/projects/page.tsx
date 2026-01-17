import { getTranslations } from "next-intl/server";
import { projectsApiServer } from "@/lib/api/projects";
import { ProjectsPageClient } from "./ProjectsPage";
import { checkRole } from "@/lib/auth/require-role";
import type { ProjectWithRelations } from "@sumbi/shared-types";

// Server Component - fetches data server-side for better performance
export default async function ProjectsPage() {
  const t = await getTranslations();

  // Get role and userId for data fetching
  const { role, userId } = await checkRole();
  const userRole = role || 'student';

  let projects: ProjectWithRelations[] = [];
  try {
    // Use server-side API client
    projects = await projectsApiServer.getAllProjects();
  } catch (error) {
    console.error('[ProjectsPage] Error fetching projects:', error);
    // Gracefully handle error - show empty projects list
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <ProjectsPageClient
        projects={projects}
        userRole={userRole}
        userId={userId}
      />
    </div>
  );
}
